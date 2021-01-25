import {
  GraphQLObject,
  GraphQLField,
  GraphQLQueryRoot,
  GraphQLTypes,
  GraphQLMutationRoot,
  GraphQLArg,
  GraphQLInput,
} from '../../decorators';

type ID = string;

@GraphQLObject()
export class Location {
  public id: ID = 'foo';

  @GraphQLField('differentFieldName')
  public custom: string = 'bar';

  @GraphQLField()
  public name: string = 'bar';

  // @GraphQLField()
  // protected name2: string = 'bar';

  // @GraphQLField()
  // private name3: string = 'bar';

  @GraphQLField()
  public name4: null | undefined | string = 'bar';

  @GraphQLField<GraphQLTypes.Int>('aNumber')
  // @GraphQLOverrideType(GraphQLTypes.Int)
  public aNumbex: number = 4;

  @GraphQLField<GraphQLTypes.Int>('aNumber2')
  public aNumbex2: null | number = 4;

  @GraphQLField<GraphQLTypes.Int>('aNumber3')
  aNumbex3(): Promise<null | number> {
    return new Promise((r) => r(null));
  }

  @GraphQLField()
  public getNotes(): null | string {
    return null;
  }

  // @GraphQLField()
  // protected getNotes2(): null | string {
  //   return null;
  // }

  // @GraphQLField()
  // private getNotes3(): null | string {
  //   return null;
  // }

  // @GraphQLField()
  // public static getNoteshh(): null | string {
  //   return null;
  // }

  public getNotesx(): null | string {
    return null;
  }

  @GraphQLField()
  public async genNotes(): Promise<string> {
    return '';
  }

  @GraphQLField()
  public genNotesMaybePromise(
    @GraphQLArg<GraphQLTypes.Int>() foo: number,
  ): undefined | Promise<string> {
    return this.genNotes();
  }

  @GraphQLField()
  public genNotesNullablePromise(): Promise<string | null> {
    return this.genNotes();
  }

  @GraphQLField()
  public genNotesMaybeNullablePromise():
    | undefined
    | Promise<string | null | undefined> {
    return this.genNotes();
  }

  @GraphQLField('custom_field_name')
  public async genMethodWithCustomFieldName(): Promise<number> {
    return 2;
  }

  @GraphQLQueryRoot('location')
  public static loadLoc(): Location {
    return new Location();
  }

  @GraphQLQueryRoot('locations')
  public static async loadAllLocations(): Promise<Array<Location>> {
    return [];
  }

  @GraphQLQueryRoot('locationStrings')
  public static someStrings(): null | Array<string> {
    return [];
  }

  @GraphQLQueryRoot('aString')
  public static aString(): string {
    return '';
  }

  @GraphQLQueryRoot<GraphQLTypes.Int>('anIntYeah')
  public static anInt(): number {
    return 4;
  }

  @GraphQLMutationRoot('create_location')
  public static async blahBlahCreateLocation(
    name: string,
    age: null | number,
    @GraphQLArg<GraphQLTypes.Int>('externalName') internalName: number,
    another?: string,
  ): Promise<Location> {
    return new Location();
  }

  @GraphQLMutationRoot('edit_location')
  public static async blahEditItYeah(input: Foo): Promise<Location> {
    return new Location();
  }
}

// TODO GraphQLArg or GraphQLCustomArg (since i don't require all the args be decorated)

// TODO GraphQLMutationRoot('...', {exposeArgumentsAsObject: true})

// TODO implement this
// this kinda sucks because it means the function can't be safely called from your own code..
// only from the framework
@GraphQLInput()
class Foo {
  @GraphQLField<GraphQLTypes.Int>('blah')
  blahBlahBlah!: undefined | number;

  // inputTypesDontNeedToAnnotateEveryFieldMaybe!: string;
}

type Fooxx = {
  /**
   * @GraphQLField<GraphQL.Int>()
   */
  age: number;
};

// /**
//  * @GraphQLInput()
//  */
// type Bar = {
//   blah: string;
// };

// type Baz = GraphQLInputX<{
//   blah: GraphQLInputField<string, 'custom_blah'>;
//   blahblah: GraphQLInputField<GraphQLTypes.Int>;
// }, 'Foo'>;

// const x: Baz = {
//   blah: '',
//   blahblah: 9,
// };

// type GraphQLInputX<TType, TExternalName = any> = TType

// type GraphQLInputField<TType, TExternalName = any> = TType;

@GraphQLObject('ObjectNameOverride')
class SomethingElse {}

// @GraphQLScalar('Date')
// export class MyDateObject {
//   static encodeForGraphQL(input: MyDateObject): string {
//     return ''
//   }
//   static decodeFromGraphQL(input: string): MyDateObject {
//     return new MyDateObject()
//   }
// }
