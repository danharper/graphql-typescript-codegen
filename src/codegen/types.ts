export interface SchemaType {
  description: null | string;
  query: null | QueryType;
  mutation: null | MutationType;
  subscription: null | SubscriptionType;
  structures: Record<TypeName, InputType | OutputType>;
}

export interface QueryType extends ObjectType {}
export interface MutationType extends ObjectType {}
export interface SubscriptionType extends ObjectType {}

export interface NonNullType<T> {
  __type: 'NonNull';
  type: T;
}

export type InputType = ScalarType | EnumType | InputObjectType;

export type OutputType =
  | ScalarType
  | ObjectType
  | InterfaceType
  | UnionType
  | EnumType;

export type TypeName = string;
type _TypePointer = TypeName | ListType<TypePointer>;
export type TypePointer = _TypePointer | NonNullType<_TypePointer>;

export interface ListType<T> {
  __type: 'List';
  items: T;
}

export interface ScalarType {
  __type: 'Scalar';
  name: string;
  description: null | string;
}

export interface ObjectType {
  __type: 'Object';
  name: string;
  description: null | string;
  fields: FieldType[];
  interfaces: TypeName[];
}

export interface InterfaceType {
  __type: 'Interface';
  name: string;
  description: null | string;
  fields: FieldType[];
  interfaces: TypeName[];
}

interface RootResolutionDetails {
  __type: 'RootResolution';
  file: string;
  export: string;
  method: string;
}

interface FromParentResolutionDetails {
  __type: 'FromParentResolution';
  method: string;
}

export type ResolutionDetails =
  | RootResolutionDetails
  | FromParentResolutionDetails;

export interface FieldType {
  __type: 'Field';
  name: string;
  description: null | string;
  type: TypePointer;
  args: ArgType[];
  resolution?: null | ResolutionDetails;
}

export interface ArgType {
  __type: 'Arg';
  name: string;
  description: null | string;
  type: TypePointer;
}

export interface UnionType {
  __type: 'Union';
  name: string;
  description: null | string;
  types: TypeName[];
}

export interface EnumType {
  __type: 'Enum';
  name: string;
  description: null | string;
  values: EnumValueType[];
}

export interface EnumValueType {
  __type: 'EnumValue';
  name: string;
  description: null | string;
}

export interface InputObjectType {
  __type: 'InputObject';
  name: string;
  description: null | string;
  fields: InputFieldType[];
}

export interface InputFieldType {
  __type: 'InputField';
  name: string;
  description: null | string;
  type: TypePointer;
}
