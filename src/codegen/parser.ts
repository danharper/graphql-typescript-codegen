import {
  ClassDeclaration,
  Decorator,
  MethodDeclaration,
  ModifierableNode,
  Node,
  Project,
  PropertyDeclaration,
  PropertyNamedNode,
  SourceFile,
  SyntaxKind,
  Type,
} from 'ts-morph';
import {
  BooleanScalar,
  DateScalar,
  FloatScalar,
  IDScalar,
  IntScalar,
  StringScalar,
  toArg,
  toField,
  toInputField,
  toInputObject,
  toList,
  toNonNull,
  toObject,
} from './builders';
import {
  ArgType,
  FieldType,
  InputFieldType,
  InputType,
  OutputType,
  ScalarType,
  SchemaType,
  TypeName,
  TypePointer,
} from './types';
import {
  invariant,
  invariantViolation,
  isPresent,
  mapObjectValues,
} from './utils';

type RootDecoratorName = 'GraphQLQueryRoot' | 'GraphQLMutationRoot';

class Parser {
  private file: SourceFile;
  private roots: Record<
    string,
    {
      source: Object;
      field: FieldType;
      root: RootDecoratorName;
    }
  > = {};
  private structures: Record<
    TypeName,
    {
      source: 'scalar' | Object;
      type: InputType | OutputType;
    }
  > = {};

  constructor(filenameToProcess: string) {
    const project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });

    this.file = project.getSourceFileOrThrow(filenameToProcess);
  }

  parse(): SchemaType {
    [
      StringScalar,
      IntScalar,
      FloatScalar,
      BooleanScalar,
      IDScalar,
      DateScalar,
    ].forEach((scalar) => {
      this.structures[scalar.name] = {source: 'scalar', type: scalar};
    });

    this.parseRootDecorators('GraphQLQueryRoot');
    this.parseRootDecorators('GraphQLMutationRoot');

    return {
      description: null,
      query: toObject({
        name: 'Query',
        description: null,
        fields: Object.values(this.roots)
          .filter((r) => r.root === 'GraphQLQueryRoot')
          .map((r) => r.field),
        interfaces: [],
      }),
      mutation: toObject({
        name: 'Mutation',
        description: null,
        fields: Object.values(this.roots)
          .filter((r) => r.root === 'GraphQLMutationRoot')
          .map((r) => r.field),
        interfaces: [],
      }),
      subscription: null,
      structures: mapObjectValues(this.structures, (s) => s.type),
    };
  }

  parseRootDecorators(rootDecoratorName: RootDecoratorName): void {
    findDecoratorReferencesOfImport(this.file, rootDecoratorName).forEach(
      (decorator: Decorator) => {
        const method = decorator.getFirstAncestorByKindOrThrow(
          SyntaxKind.MethodDeclaration,
        );

        assertIsPublicStatic(method);

        const root = this._visitMethod(decorator, method);

        invariant(!this.roots[root.name], `Duplicate root "${root.name}"`);

        // gotta get:
        // containing class name
        // ensure it's exported
        // file name

        this.roots[root.name] = {
          source: method,
          root: rootDecoratorName,
          field: toField({
            ...root,
            resolution: {
              __type: 'RootResolution',
              // file: [
              //   method.getSourceFile().getDirectory().getPath(),
              //   method.getSourceFile().getDirectoryPath(),
              //   __dirname,
              //   process.cwd(),
              // ].join('\n\n'),
              file:
                '.' +
                method
                  .getSourceFile()
                  .getFilePath()
                  .replace('.ts', '')
                  .replace(process.cwd(), ''),
              export: method
                .getParentIfKindOrThrow(SyntaxKind.ClassDeclaration)
                .getNameOrThrow(),
              method: method.getName(),
            },
          }),
        };
      },
    );
  }

  _visitMethod(decorator: Decorator, method: MethodDeclaration): FieldType {
    return toField({
      name: getMethodName(decorator, method),
      description: null,
      type: this.visitReturnType(decorator, method.getReturnType()),
      args: this.visitMethodArgs(method),
    });
  }

  visitReturnType(
    decorator: null | Decorator,
    originalType: Type,
  ): TypePointer {
    return unwrapAndWrapType(decorator, originalType, (node) => {
      return this.visitOutputNode(node);
    });
  }

  visitOutputNode(node: Node): TypeName {
    if (Node.isClassDeclaration(node)) {
      return this.visitOutputClassDeclaration(node);
    }

    invariantViolation(`Couldn't visitOutputNode, "${node.getKindName()}"`);
  }

  visitOutputClassDeclaration(node: ClassDeclaration): TypeName {
    const decorator = node.getDecoratorOrThrow('GraphQLObject');

    const className = nameFromDecorator(decorator) ?? node.getNameOrThrow();

    if (this.structures[className]) {
      invariant(
        this.structures[className].source === node,
        `Already seen class ${className}, but it's not the same.`,
      );
      return className;
    }

    const output = toObject({
      name: className,
      description: null,
      fields: [
        ...node.getMethods().map(this.visitMethod.bind(this)),
        ...node.getProperties().map(this.visitOutputProperty.bind(this)),
        // TODO validation on duplicates here
      ].filter(isPresent),
      interfaces: [],
    });

    this.structures[className] = {
      source: node,
      type: output,
    };

    return className;
  }

  visitOutputProperty(property: PropertyDeclaration): null | FieldType {
    const decorator = property.getDecorator('GraphQLField');
    if (!decorator) {
      return null;
    }

    assertIsNonStaticPublic(property);

    return toField({
      name: nameFromDecorator(decorator) ?? property.getName(),
      description: null,
      type: this.visitReturnType(decorator, property.getType()),
      args: [],
    });
  }

  visitMethod(method: MethodDeclaration): null | FieldType {
    const decorator = method.getDecorator('GraphQLField');
    if (!decorator) {
      return null;
    }

    assertIsNonStaticPublic(method);

    return toField({
      ...this._visitMethod(decorator, method),
      resolution: {
        __type: 'FromParentResolution',
        method: method.getName(),
      },
    });
  }

  visitMethodArgs(method: MethodDeclaration): ArgType[] {
    return method.getParameters().map((param) => {
      const decorator = param.getDecorator('GraphQLArg') ?? null;

      return toArg({
        name: (decorator && nameFromDecorator(decorator)) ?? param.getName(),
        description: null,
        type: this.visitInputType(decorator, param.getType()),
      });
    });
  }

  visitInputType(decorator: null | Decorator, originalType: Type): TypePointer {
    return unwrapAndWrapType(decorator, originalType, (node) =>
      this.visitInputNode(node),
    );
  }

  visitInputNode(node: Node): TypeName {
    if (Node.isClassDeclaration(node)) {
      return this.visitInputClassDeclaration(node);
    }

    invariantViolation(`Couldn't visitInputNode "${node.getKindName()}"`);
  }

  visitInputClassDeclaration(node: ClassDeclaration): TypeName {
    const decorator = node.getDecoratorOrThrow('GraphQLInput');

    const className = nameFromDecorator(decorator) ?? node.getNameOrThrow();

    if (this.structures[className]) {
      invariant(
        this.structures[className].source === node,
        `Already seen class input object ${className}, but it's not the same.`,
      );
      return className;
    }

    invariant(
      node.getConstructors().length === 0,
      `GraphQLInputObjects using the "class" syntax must have no constructor, but found one on "${className}"`,
    );

    invariant(
      node.getMethods().length === 0,
      `GraphQLInputObjects using the "class" syntax must have no methods, but found some on "${className}"`,
    );

    const output = toInputObject({
      name: className,
      description: null,
      fields: [
        ...node.getProperties().map(this.visitInputProperty.bind(this)),
        // TODO validation on duplicates here
      ].filter(isPresent),
    });

    this.structures[className] = {
      source: node,
      type: output,
    };

    return className;
  }

  visitInputProperty(property: PropertyDeclaration): null | InputFieldType {
    const decorator = property.getDecorator('GraphQLField');
    invariant(
      decorator != null,
      `All properties in a GraphQLInputObject using the "class" syntax must using the GraphQLField annotation, "${property.getName()}" does not`,
    );

    const disallowedPropertyModifiers = property
      .getModifiers()
      .map((m) => m.getText())
      .filter((m) => m !== 'public');

    invariant(
      disallowedPropertyModifiers.length === 0,
      `GraphQLInputObject properties using GraphQLField must have no modifiers, but "${property.getName()} has "${disallowedPropertyModifiers.join(
        ', ',
      )}"`,
    );

    return toInputField({
      name: nameFromDecorator(decorator) ?? property.getName(),
      description: null,
      type: this.visitInputType(decorator, property.getType()),
    });
  }
}

//
//
//
//
// Utilities

function unwrapAndWrapType(
  decorator: null | Decorator,
  originalType: Type,
  fn: (node: Node) => TypeName,
): TypePointer {
  let {type, isNullable} = unwrapPromise(originalType);

  let isArray = false;
  let arrayItemsNullable = false;
  if (type.isArray()) {
    isArray = true;
    type = type.getArrayElementTypeOrThrow();
    if (type.isNullable()) {
      arrayItemsNullable = true;
      type = type.getNonNullableType();
    }
  }

  let theType: null | TypePointer =
    ((decorator && _getTypeOverride(decorator, type)) ?? typeToScalar(type))
      ?.name ?? null;

  if (!theType) {
    const typeValue = type.getSymbolOrThrow().getValueDeclarationOrThrow();

    theType = fn(typeValue);
  }

  invariant(theType != null, `Failed to parse return type.`);

  if (isArray) {
    if (!arrayItemsNullable) {
      theType = toNonNull(theType);
    }
    theType = toList(theType);
  }

  if (!isNullable) {
    theType = toNonNull(theType);
  }

  return theType;
}

function unwrapPromise(type: Type): {type: Type; isNullable: boolean} {
  if (type.getNonNullableType().getText().startsWith('Promise<')) {
    const typeArgs = type.getNonNullableType().getTypeArguments();
    invariant(
      typeArgs.length === 1,
      `Expected 1 type argument on promise, got ${
        typeArgs.length
      }; for "${type.getText()}" inner: "${type
        .getNonNullableType()
        .getText()}"`,
    );

    return {
      type: typeArgs[0].getNonNullableType(),
      isNullable: typeArgs[0].isNullable() || type.isNullable(),
    };
  }

  return {type: type.getNonNullableType(), isNullable: type.isNullable()};
}

function typeToScalar(type: Type): null | ScalarType {
  if (type.isString()) {
    return StringScalar;
  } else if (type.isNumber()) {
    return FloatScalar;
  } else if (type.isBoolean()) {
    return BooleanScalar;
  } else {
    return null;
  }
}

function _getTypeOverride(
  decorator: Decorator,
  returnType: Type,
): ScalarType | null {
  // @GraphQLField<GraphQLTypes.Int>()
  //               ^^^^^^^^^^^^^^^^
  let arg = decorator.getTypeArguments()[0];
  if (!arg) {
    return null;
  }

  invariant(
    Node.isTypeReferenceNode(arg),
    'Invalid type argument provided to @GraphQLField<...>()',
  );

  // this isn't great since it's literally doing string checks
  // and you could define something else as GraphQLTypes and.. boom it'll work.

  const qualifiedName = arg.getChildAtIndexIfKind(0, SyntaxKind.QualifiedName);
  // @GraphQLField<GraphQLTypes.Int>()
  //               ^^^^^^^^^^^^
  invariant(
    qualifiedName?.getLeft().getText() === 'GraphQLTypes',
    `Invalid GraphQLField type argument provided, must be a literal access of GraphQLTypes.XXX, found: "${arg.getText()}"`,
  );

  // @GraphQLField<GraphQLTypes.Int>()
  //                            ^^^
  const typeKey = qualifiedName.getRight().getText();

  const validator = typeOverrideValidators[typeKey];
  invariant(
    validator,
    `Internal error: no validator for type override parameter "${typeKey}"`,
  );

  const theScalar = validator(returnType.getNonNullableType().getText());
  invariant(
    theScalar != null,
    `Invalid GraphQLField type argument provided, override "${typeKey}" is not allowed for "${returnType.getText()}"; at:\n\n${decorator
      .getParent()
      .getText()}`,
  );

  return theScalar;
}

// to prevent e.g. @GraphQLField<GraphQLTypes.Int>() being used on a "string" property
const typeOverrideValidators: Record<
  string, // GraphQLTypes key
  (originalReturnType: string) => ScalarType | null
> = {
  Int: (original) => (original === 'number' ? IntScalar : null),
  Float: (original) => (original === 'number' ? FloatScalar : null),
  Date: (original) =>
    original === 'number' || original === 'string' ? DateScalar : null,
  ID: (original) =>
    original === 'number' || original === 'string' ? IDScalar : null,
};

function getMethodName(
  decorator: Decorator,
  method: MethodDeclaration,
): string {
  return nameFromDecorator(decorator) ?? method.getName();
}

function nameFromDecorator(decorator: Decorator): null | string {
  const args = decorator.getArguments();
  if (args.length === 0) {
    return null;
  }

  const arg = args[0];
  invariant(
    Node.isStringLiteral(arg),
    `Custom name must be a string literal, given: "${arg.getText()}"`,
  );

  return arg.getLiteralText();
}

function assertIsPublicStatic(method: MethodDeclaration): void {
  invariant(
    method.hasModifier('static'),
    `Roots must be static, "${method.getName()}" is not`,
  );

  const BANNED_MODIFIERS = ['protected', 'private'];
  const disallowedModifiers = method
    .getModifiers()
    .map((m) => m.getText())
    .filter((m) => BANNED_MODIFIERS.includes(m));
  invariant(
    disallowedModifiers.length === 0,
    `Roots must be public, "${method.getName()}" is not; found "${disallowedModifiers.join(
      ', ',
    )}"`,
  );
}

function assertIsNonStaticPublic(
  node: ModifierableNode & PropertyNamedNode,
): void {
  const BANNED_MODIFIERS = ['protected', 'private', 'static'];

  const disallowedModifiers = node
    .getModifiers()
    .map((m) => m.getText())
    .filter((m) => BANNED_MODIFIERS.includes(m));

  invariant(
    disallowedModifiers.length === 0,
    `Methods declared with GraphQLField must be public, and non-static. "${node.getName()}" has "${disallowedModifiers.join(
      ', ',
    )}" modifiers`,
  );
}

function findDecoratorReferencesOfImport(
  file: SourceFile,
  importName: string,
): Decorator[] {
  // https://github.com/dsherret/ts-morph/issues/430
  // there's a better way to do this, with project.getAmbientModule('...')
  const lib = file.getImportDeclarationOrThrow('../library');
  const namedImportNode = lib
    .getNamedImports()
    .find((imp) => imp.getName() === importName);

  if (!namedImportNode) {
    return [];
  }

  return namedImportNode
    .getNameNode()
    .findReferencesAsNodes()
    .filter(
      (n: Node) =>
        n.getSourceFile() === file &&
        !Node.isImportSpecifier(n.getParentOrThrow()),
    )
    .map((node) => node.getFirstAncestorByKind(SyntaxKind.Decorator))
    .filter(isPresent);
}

//
//
//
//
// Exports

export function parser(filenameToProcess: string): SchemaType {
  return new Parser(filenameToProcess).parse();
}
