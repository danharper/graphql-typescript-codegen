// @ts-ignore
export function GraphQLObject(externalName?: string) {
  // @ts-ignore
  return function (klass: Function) {};
}

// @ts-ignore
export function GraphQLInput(externalName?: string) {
  // @ts-ignore
  return function (klass: Function) {};
}

// @ts-ignore
export function GraphQLQueryRoot<T extends null | GraphQLTypes = null>(
  // @ts-ignore
  name: string,
) {
  return function (
    // @ts-ignore
    target: any,
    // @ts-ignore
    propertyKey: string,
    // @ts-ignore
    descriptor: PropertyDescriptor,
  ) {};
}

// @ts-ignore
export function GraphQLField<T extends null | GraphQLTypes = null>(
  // @ts-ignore
  externalName?: string,
) {
  // @ts-ignore
  return function (target: any, key: string): void {};
}

// @ts-ignore
export function GraphQLMutationRoot(name: string) {
  return function (
    // @ts-ignore
    target: any,
    // @ts-ignore
    propertyKey: string,
    // @ts-ignore
    description: PropertyDescriptor,
  ) {};
}

// @ts-ignore
export function GraphQLArg<T extends null | GraphQLTypes = null>(
  // @ts-ignore
  externalName?: string,
) {
  return function (
    // @ts-ignore
    target: Object,
    // @ts-ignore
    propertyKey: string | symbol,
    // @ts-ignore
    parameterIndex: number,
  ) {};
}

export enum GraphQLTypes {
  Int,
  Float,
  Date,
}
