import type {
  InputType,
  ObjectType,
  OutputType,
  SchemaType,
  TypePointer,
  InputObjectType,
  ScalarType,
} from './types';
import {assertUnreachable, invariantViolation} from './utils';

class Printer {
  private depth = 0;
  private text = '';
  indent() {
    this.depth++;
    return this;
  }
  dedent() {
    this.depth--;
    return this;
  }
  line(text: string) {
    return this.startLine().write(text).endLine();
  }
  startLine() {
    this.text += ' '.repeat(this.depth * 2);
    return this;
  }
  write(text: string) {
    this.text += text;
    return this;
  }
  endLine() {
    this.text += '\n';
    return this;
  }
  get(): string {
    return this.text;
  }
}

export function generator(schema: SchemaType): string {
  const p = new Printer();

  p.line(`// @generated`);
  p.line(
    `import {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString} from 'graphql';`,
  );
  p.line('');

  [...Object.values(schema.structures), schema.query, schema.mutation].map(
    (structure) => {
      if (structure && !isNativeScalar(structure)) {
        p.line('');
        switch (structure.__type) {
          case 'Scalar':
            return printScalar(p, structure);
          case 'Object':
            return printObject(p, structure);
          case 'InputObject':
            return printInputObject(p, structure);
          case 'Union':
          case 'Enum':
          case 'Interface':
            invariantViolation(
              `Not implemented generator for "${structure.__type}"`,
            );
          default:
            assertUnreachable(structure);
        }
      }
    },
  );

  p.line('');
  p.line(`export const schema = new GraphQLSchema({`).indent();
  if (schema.query) {
    p.line(`query: ${generatedName(schema.query)},`);
  }
  if (schema.mutation) {
    p.line(`mutation: ${generatedName(schema.mutation)},`);
  }
  p.dedent().line(`});`);

  return p.get();

  function printScalar(p: Printer, structure: ScalarType): void {
    if (isNativeScalar(structure)) {
      return;
    }

    p.line(
      `const ${generatedName(structure)} = new GraphQLScalarType({`,
    ).indent();
    p.line(`name: ${JSON.stringify(structure.name)},`);
    p.line(`description: ${JSON.stringify(structure.description)},`);
    p.dedent().line(`});`);
  }

  function printObject(p: Printer, structure: ObjectType): void {
    p.line(
      `const ${generatedName(structure)} = new GraphQLObjectType({`,
    ).indent();
    p.line(`name: ${JSON.stringify(structure.name)},`);
    if (structure.description) {
      p.line(`description: ${JSON.stringify(structure.description)},`);
    }
    p.line(`fields: () => ({`).indent();
    structure.fields.forEach((field) => {
      p.line(`${field.name}: {`).indent();
      p.line(`type: ${printType(field.type)},`);
      if (field.args.length > 0) {
        p.line(`args: {`).indent();
        field.args.forEach((arg) => {
          p.line(`${arg.name}: {`).indent();
          if (arg.description) {
            p.line(`description: ${JSON.stringify(arg.description)},`);
          }
          p.line(`type: ${printType(arg.type)},`);
          p.dedent().line(`},`);
        });
        p.dedent().line(`},`);
      }
      if (field.resolution) {
        switch (field.resolution.__type) {
          case 'RootResolution': {
            p.line(`resolve: async (_, args) => {`).indent();
            p.line(`const module = await import("${field.resolution.file}");`);
            if (field.args.length > 0) {
              p.line(
                `return module.${field.resolution.export}.${field.resolution.method}(`,
              ).indent();
              p.startLine();
              field.args.forEach((arg) => {
                p.write(`args.${arg.name}, `);
              });
              p.endLine();
              p.dedent().line(`);`);
            } else {
              p.line(
                `return module.${field.resolution.export}.${field.resolution.method}();`,
              );
            }
            p.dedent().line(`},`);
            break;
          }
          case 'FromParentResolution':
            p.line(`resolve: async (parent, args) => {`).indent();
            if (field.args.length > 0) {
              p.line(`return parent.${field.resolution.method}(`).indent();
              p.startLine();
              field.args.forEach((arg) => {
                p.write(`args.${arg.name}, `);
              });
              p.endLine();
              p.dedent().line(`);`);
            } else {
              p.line(`return parent.${field.resolution.method}();`);
            }
            p.dedent().line(`},`);
            break;
          default:
            assertUnreachable(field.resolution);
        }
      }
      p.dedent().line(`},`);
    });
    p.dedent().line(`}),`);
    p.dedent().line(`});`);
  }

  function printInputObject(p: Printer, structure: InputObjectType): void {
    p.line(
      `const ${generatedName(structure)} = new GraphQLInputObjectType({`,
    ).indent();
    p.line(`name: ${JSON.stringify(structure.name)},`);
    if (structure.description) {
      p.line(`description: ${JSON.stringify(structure.description)},`);
    }
    p.line(`fields: () => ({`).indent();
    structure.fields.forEach((field) => {
      p.line(`${field.name}: {`).indent();
      p.line(`type: ${printType(field.type)},`);
      p.dedent().line(`},`);
    });
    p.dedent().line(`}),`);
    p.dedent().line(`});`);
  }

  function printType(typePointer: TypePointer): string {
    if (typeof typePointer === 'string') {
      return generatedName(schema.structures[typePointer]);
    }

    switch (typePointer.__type) {
      case 'List':
        return `new GraphQLList(${printType(typePointer.items)})`;
      case 'NonNull':
        return `new GraphQLNonNull(${printType(typePointer.type)})`;
      default:
        assertUnreachable(typePointer);
    }
  }
}

const NATIVE_SCALARS = ['String', 'Int', 'Float', 'Boolean', 'ID'];
function isNativeScalar(
  structure: InputType | OutputType,
): structure is ScalarType & {
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'ID';
} {
  return (
    structure.__type === 'Scalar' && NATIVE_SCALARS.includes(structure.name)
  );
}

function generatedName(structure: InputType | OutputType): string {
  switch (structure.__type) {
    case 'Scalar': {
      switch (structure.name) {
        case 'String':
          return 'GraphQLString';
        case 'Int':
          return 'GraphQLInt';
        case 'Float':
          return 'GraphQLFloat';
        case 'ID':
          return 'GraphQLID';
        case 'Boolean':
          return 'GraphQLBoolean';
        default:
          return `GeneratedGraphQLScalar_${structure.name}`;
      }
    }
    case 'Object':
      return `GeneratedGraphQLObject_${structure.name}`;
    case 'InputObject':
      return `GeneratedGraphQLInputObject_${structure.name}`;
    case 'Union':
      return `GeneratedGraphQLUnion_${structure.name}`;
    case 'Enum':
      return `GeneratedGraphQLEnum_${structure.name}`;
    case 'Interface':
      return `GeneratedGraphQLInterface_${structure.name}`;
    default:
      assertUnreachable(structure);
  }
}
