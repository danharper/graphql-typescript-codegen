import {
  GraphQLObject,
  GraphQLField,
  GraphQLQueryRoot,
  GraphQLTypes,
  GraphQLMutationRoot,
  GraphQLArg,
  GraphQLInput,
} from '../../decorators';
import {Location, Foo} from './blah';

export class Map {
  @GraphQLQueryRoot('map_locations')
  static async locations(): Promise<string[]> {
    return [];
  }

  @GraphQLQueryRoot('new_map_location')
  static async mapLoc(input: Foo): Promise<null | Location> {
    return null;
  }
}
