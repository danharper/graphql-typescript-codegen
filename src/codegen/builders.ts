import {
  ArgType,
  FieldType,
  InputFieldType,
  InputObjectType,
  InputType,
  InterfaceType,
  ListType,
  NonNullType,
  ObjectType,
  OutputType,
  ScalarType,
} from './types';

const toScalar = (name: string): ScalarType => ({
  __type: 'Scalar',
  name,
  description: null,
});
export const StringScalar = toScalar('String');
export const IntScalar = toScalar('Int');
export const FloatScalar = toScalar('Float');
export const BooleanScalar = toScalar('Boolean');
export const IDScalar = toScalar('ID');
export const DateScalar = toScalar('Date');
export const toNonNull = <T>(type: T): NonNullType<T> => ({
  __type: 'NonNull',
  type,
});
export const toList = <T>(type: T): ListType<T> => ({
  __type: 'List',
  items: type,
});

const makeBuilder = <
  T extends
    | InputType
    | OutputType
    | FieldType
    | ArgType
    | InputObjectType
    | InputFieldType
>(
  __type: T['__type'],
) => (fields: Omit<T, '__type'>): T => ({...fields, __type} as any);

export const toObject = makeBuilder<ObjectType>('Object');
export const toInputObject = makeBuilder<InputObjectType>('InputObject');
export const toInputField = makeBuilder<InputFieldType>('InputField');
export const toInterface = makeBuilder<InterfaceType>('Interface');
export const toField = makeBuilder<FieldType>('Field');
export const toArg = makeBuilder<ArgType>('Arg');
