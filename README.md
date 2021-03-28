# GraphQL TypeScript Codegen

Take your existing TypeScript data structures, add decorators, and generate a full GraphQL schema.

**How is this different from other libraries?** They use the decorators at runtime, where type information is limited. This project runs using the TypeScript compiler, and so has access to full details. This means no duplicate type definitions, and fewer workarounds.

**Unfinished** This is just something I hacked on to scratch an itch for a side project; it's unfinished (see "What's not done" below), and I may not continue it. Open sourcing it because I think it's cool ;)

## Usage

Let's build a blog, containing posts and authors. We'll expose 2 root queries: `blog_posts` and `blog_post(id: ID)`; and a mutation: `like_blog_post(id: ID)`.

Here's a subset of an existing BlogPost and Author class:

```ts
class BlogPost {
  static async loadAll(): Promise<Array<BlogPost>> {
    // ...
  }

  static async findByID(id: number): Promise<?BlogPost> {
    // ...
  }
  
  // ...

  getID(): number {
    return this._data.id;
  }
  
  getTitle(): string {
    return this._data.title;
  }
  
  getPublishedTime(): number {
    return this._data.publishedTime;
  }
  
  async getAuthor(): Promise<Author> {
    return await Author.findByID(this._data.authorID);
  }
}

class Author {
  static async findByID(id: number): Promise<Author> {
    // ...
  }
  
  getID(): number {
    return this._data.id;
  }
  
  getName(): string {
    return this._data.name;
  }
  
  getPasswordHash(): string {
    return this._data.password;
  }
}
```

#### Expose Blog Post & Author object types

Let's use the `@GraphQLObject()` decorator to expose the objects.  
Those objects will be empty - we explicitly expose fields using `@GraphQLField()` on methods or properties. See how we can choose NOT to expose some methods. This works on async/Promises too, or methods returning arrays.  
Finally, we'll use `@GraphQLQueryRoot()` to expose static query methods.  


```diff
+ @GraphQLObject()
class BlogPost {
+ @GraphQLQueryRoot('blog_posts')
  static async loadAll(): Promise<Array<BlogPost>> {
    // ...
  }

+ @GraphQLQueryRoot('blog_post')
  static async findByID(id: number): Promise<?BlogPost> {
    // ...
  }
  
  // ...

+ @GraphQLField('id')
  getID(): number {
    return this._data.id;
  }
  
+ @GraphQLField('title')
  getTitle(): string {
    return this._data.title;
  }
  
+ @GraphQLField('published_time')
  getPublishedTime(): number {
    return this._data.publishedTime;
  }

+ @GraphQLField('author')
  async getAuthor(): Promise<Author> {
    return await Author.findByID(this._data.authorID);
  }
}

+ @GraphQLObject()
class Author {
  static async findByID(id: number): Promise<Author> {
    // ...
  }
  
+ @GraphQLField('id')
  getID(): number {
    return this._data.id;
  }
  
+ @GraphQLField('name')
  getName(): string {
    return this._data.name;
  }
  
  getPasswordHash(): string {
    return this._data.password;
  }
}
```

This will produce a GraphQL code structure, which produces a GraphQL schema like so:

```
type Query {
  blog_posts: [BlogPost!]!
  blog_post(id: Float!): BlogPost
}

type BlogPost {
  id: Float!
  title: String!
  published_time: Float!
  author: Author!
}

type Author {
  id: Float!
  name: String!
}
```

#### Specify "number" types

Kinda sucks that all the "number" fields in TypeScript are a "Float" type in GraphQL? That's because JS lacks explicit Int/Float types, so everything _could_ be a float.

You can specify an explicit type if needed, either `Int`, `Float` or `ID`:

```diff
 @GraphQLObject()
class BlogPost {
  @GraphQLQueryRoot('blog_posts')
  static async loadAll(): Promise<Array<BlogPost>> {
    // ...
  }

  @GraphQLQueryRoot('blog_post')
  static async findByID(id: number): Promise<?BlogPost> {
    // ...
  }
  
  // ...

- @GraphQLField('id')
+ @GraphQLField<GraphQLTypes.ID>('id')
  getID(): number {
    return this._data.id;
  }
  
  @GraphQLField('title')
  getTitle(): string {
    return this._data.title;
  }
  
- @GraphQLField('published_time')
+ @GraphQLField<GraphQLTypes.Int>('published_time')
  getPublishedTime(): number {
    return this._data.publishedTime;
  }

  @GraphQLField('author')
  async getAuthor(): Promise<Author> {
    return await Author.findByID(this._data.authorID);
  }
}

@GraphQLObject()
class Author {
- static async findByID(id: number): Promise<Author> {
+ static async findByID(@GraphQLArg<GraphQLTypes.ID>() id: number): Promise<Author> {
    // ...
  }
  
- @GraphQLField('id')
+ @GraphQLField<GraphQLTypes.Int>('id')
  getID(): number {
    return this._data.id;
  }
  
  @GraphQLField('name')
  getName(): string {
    return this._data.name;
  }
  
  getPasswordHash(): string {
    return this._data.password;
  }
}
```

Which'll correct our generated schema:

```diff
type Query {
  blog_posts: [BlogPost!]!
- blog_post(id: Float!): BlogPost
+ blog_post(id: ID!): BlogPost
}

type BlogPost {
- id: Float!
+ id: ID!
  title: String!
- published_time: Float!
+ published_time: Int!
  author: Author!
}

type Author {
- id: Float!
+ id: ID!
  name: String!
}
```

#### Mutations

todo docs, but use `@GraphQLMutationRoot()` (like `@GraphQLQueryRoot()`), and `@GraphQLInputObject()` on any argument input objects.

#### What's not done?

Interfaces. You can't put TypeScript decorators on them. Thinking of defining them with docblock comments instead..? Or some no-op runtime-style call, like `__exposeGraphQLInterface<MyInterfaceTypeHere>()` - fields are harder/weirder to mark explicitly though..

Enums. Similarly to the above - you can't put TypeScript decorators on them.

## Decorators

**`@GraphQLQueryRoot(name: string)`** Add to a static class method, exposes `name` as a root query field. Any arguments to the method, and the return type, should be GraphQL-compatible (e.g. scalars, types using `@GraphQLObject()`, etc.)

**`@GraphQLMutationRoot(name: string)`** Add to a static class method, exposes `name` as a root mutation field. Any arguments to the method, and the return type, should be GraphQL-compatible (e.g. scalars, types using `@GraphQLObject()`, etc.)

**`@GraphQLObject(externalName?: string)`** Add to a class, creates a GraphQL object type you can return from query/mutation/fields. Use `@GraphQLField()` to expose fields/methods on the class. If `externalName` isn't provided, it uses the name of your class.

**`@GraphQLInput(externalName?: string)`** Add to a class, creates a GraphQL Input Object type you can use as input arguments to query/mutation fields. Use `@GraphQLField()` to expose fields/methods on the class. If `externalName` isn't provided, it uses the name of your class.

**`@GraphQLField(externalName?: string)`** Add to a class property or method, exposes it as a GraphQL field on the parent Object/Input Object. Any arguments to the method, and the return type, should be GraphQL-compatible (e.g. scalars, types using `@GraphQLObject()`, etc.)

**`@GraphQLField<GraphQLTypes.Int>()` / `@GraphQLArg<GraphQLTypes.Float>()`** Use the type parameter to specify if a `number` TypeScript type should be an Int or Float.

**`@GraphQLArg(externalName?: string)`** Add to a method argument to override the name of the argument on GraphQL. If not used, the argument is exposed using the name of the argument.

**`@GraphQLArg<GraphQLTypes.Int>()` / `@GraphQLArg<GraphQLTypes.Float>()`** Use the type parameter to specify if a `number` TypeScript type should be an Int or Float.

## Example

```ts
@GraphQLObject('BlogPost')
export class MyBlogPost {
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
// @generated

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

Which can then generate your GraphQL standard definition file too:

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
