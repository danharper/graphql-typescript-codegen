# GraphQL TypeScript Codegen

Take your existing TypeScript data structures, add decorators, and generate a full GraphQL schema.

How is this different from other libraries? They use the decorators at runtime, where type information is limited. This project runs using the TypeScript compiler, and so has access to full details. This means no duplicate type definitions, and less workarounds.

```ts
@GraphQLObject('BlogPost')
export class WordPressBlogPost {
  @GraphQLField<GraphQLID>()
  getID(): number {
    return 3;
  }

  @GraphQLField()
  title: string = 'bar';

  @GraphQLField('body')
  async getBody(): Promise<string> {
    return ...;
  }

  @GraphQLField('author')
  async getAuthor(): Promise<Author> {
    return ...;
  }

  getSomethingElseNotExposedToGraphQL(): string {
    return ...;
  }
}

@GraphQLObject()
export class Author {
  @GraphQLField()
  id: GraphQLID;

  @GraphQLField()
  name: ?string;
}

export class BlogPostRepository {
  @GraphQLQueryRoot('blog_post')
  async getPostByID(
    @GraphQLArg<GraphQLID>() id: number,
  ): Promise<?BlogPost> {
    return ...;
  }

  @GraphQLQueryRoot('blog_posts')
  async queryPosts(
    titleContains?: string,
    @GraphQLArg<GraphQLID>('author') authorID?: number,
  ): Promise<BlogPost[]> {
    return ...;
  }

  @GraphQLQueryRoot('authors')
  async queryAuthors(): Promise<Author[]> {
    return ...;
  }

  @GraphQLMutationRoot('publish_post')
  async publishPost(
    id: GraphQLID,
  ): Promise<BlogPost> {
    ...
  }
}
```

Generates the following file:

```js
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

const GeneratedGraphQLObject_BlogPost = new GraphQLObjectType({
  name: 'BlogPost',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve(parent, args) {
        return parent.getID();
      },
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    body: {
      type: new GraphQLNonNull(GraphQLString),
      async resolve(parent, args) {
        return await parent.getBody();
      },
    },
    author: {
      type: new GraphQLNonNull(GeneratedGraphQLObject_Author),
      async resolve(parent, args) {
        return await parent.getAuthor();
      },
    },
  }),
});

const GeneratedGraphQLObject_Author = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
  }),
});

const GeneratedGraphQLObject_Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    blog_post: {
      type: GeneratedGraphQLObject_BlogPost,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      async resolve(_, args) {
        const module = await import('../path/to/BlogPostRepository');
        return await module.BlogPostRepository.getPostByID(args.id);
      },
    },
    blog_posts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(GeneratedGraphQLObject_BlogPost)),
      ),
      args: {
        titleContains: {
          type: GraphQLString,
        },
        author: {
          type: GraphQLID,
        },
      },
      async resolve(_, args) {
        const module = await import('../path/to/BlogPostRepository');
        return await module.BlogPostRepository.queryPosts(
          args.titleContains,
          args.author,
        );
      },
    },
    authors: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(GeneratedGraphQLObject_Author)),
      ),
      async resolve(_, args) {
        const module = await import('../path/to/BlogPostRepository');
        return await module.BlogPostRepository.queryAuthors();
      },
    },
  }),
});

const GeneratedGraphQLObject_Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    publish_post: {
      type: new GraphQLNonNull(GeneratedGraphQLObject_BlogPost),
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      async resolve(_, args) {
        const module = await import('../path/to/BlogPostRepository');
        return await module.BlogPostRepository.publishPost(args.id);
      },
    },
  }),
});

export const schema = new GraphQLSchema({
  query: GeneratedGraphQLObject_Query,
  mutation: GeneratedGraphQLObject_Mutation,
});
```

Which, of course, can then generate your GraphQL standard definition file too:

```graphql
type BlogPost {
  id: ID!
  title: String!
  body: String!
  author: Author!
}

type Author {
  id: ID!
  name: String
}

type Query {
  blog_post(id: ID!): BlogPost
  blog_posts(titleContains: String, author: ID): [BlogPost!]!
  authors: [Author!]!
}

type Mutation {
  publish_post(id: ID!): BlogPost!
}
```
