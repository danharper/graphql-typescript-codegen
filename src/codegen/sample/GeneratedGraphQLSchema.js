// @generated
const {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLSchema, GraphQLString} = require('graphql');


const GeneratedGraphQLScalar_Date = new GraphQLScalarType({
  name: "Date",
  description: null,
});

const GeneratedGraphQLObject_Location = new GraphQLObjectType({
  name: "Location",
  fields: () => ({
    aNumber3: {
      type: GraphQLInt,
      resolve: async (parent, args) => {
        return parent.aNumbex3();
      },
    },
    getNotes: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        return parent.getNotes();
      },
    },
    genNotes: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (parent, args) => {
        return parent.genNotes();
      },
    },
    genNotesMaybePromise: {
      type: GraphQLString,
      args: {
        foo: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: async (parent, args) => {
        return parent.genNotesMaybePromise(
          args.foo, 
        );
      },
    },
    genNotesNullablePromise: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        return parent.genNotesNullablePromise();
      },
    },
    genNotesMaybeNullablePromise: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        return parent.genNotesMaybeNullablePromise();
      },
    },
    custom_field_name: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: async (parent, args) => {
        return parent.genMethodWithCustomFieldName();
      },
    },
    differentFieldName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name4: {
      type: GraphQLString,
    },
    aNumber: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    aNumber2: {
      type: GraphQLInt,
    },
  }),
});

const GeneratedGraphQLInputObject_Foo = new GraphQLInputObjectType({
  name: "Foo",
  fields: () => ({
    blah: {
      type: GraphQLInt,
    },
  }),
});

const GeneratedGraphQLObject_Query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    location: {
      type: new GraphQLNonNull(GeneratedGraphQLObject_Location),
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.loadLoc();
      },
    },
    locations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GeneratedGraphQLObject_Location))),
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.loadAllLocations();
      },
    },
    locationStrings: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.someStrings();
      },
    },
    aString: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.aString();
      },
    },
    anIntYeah: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.anInt();
      },
    },
    map_locations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      resolve: async (_, args) => {
        const module = await import("./Map");
        return module.Map.locations();
      },
    },
    new_map_location: {
      type: GeneratedGraphQLObject_Location,
      args: {
        input: {
          type: new GraphQLNonNull(GeneratedGraphQLInputObject_Foo),
        },
      },
      resolve: async (_, args) => {
        const module = await import("./Map");
        return module.Map.mapLoc(
          args.input, 
        );
      },
    },
  }),
});

const GeneratedGraphQLObject_Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    create_location: {
      type: new GraphQLNonNull(GeneratedGraphQLObject_Location),
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        age: {
          type: GraphQLFloat,
        },
        externalName: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        another: {
          type: GraphQLString,
        },
      },
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.blahBlahCreateLocation(
          args.name, args.age, args.externalName, args.another, 
        );
      },
    },
    edit_location: {
      type: new GraphQLNonNull(GeneratedGraphQLObject_Location),
      args: {
        input: {
          type: new GraphQLNonNull(GeneratedGraphQLInputObject_Foo),
        },
      },
      resolve: async (_, args) => {
        const module = await import("./blah");
        return module.Location.blahEditItYeah(
          args.input, 
        );
      },
    },
  }),
});

exports.schema = new GraphQLSchema({
  query: GeneratedGraphQLObject_Query,
  mutation: GeneratedGraphQLObject_Mutation,
});
