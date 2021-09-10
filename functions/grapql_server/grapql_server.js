const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const q = faunadb.query;
require('events').EventEmitter.defaultMaxListeners = 4000;
var client = new faunadb.Client({ secret: process.env.FAUNA });

const typeDefs = gql`
  type Query {
    todos: [Todo]!
  }
  type Todo {
    id: ID!
    text: String!
    done: Boolean!
  }
  type Mutation {
    addTodo(text: String!): Todo
    updateTodoDone(text : String!, done: Boolean!): Todo
    deleteTodo(text: String!):Todo
  }
`;

const resolvers = {
  Query: {
    todos: async () => {
      const results = await client.query(
        q.Map(
          q.Paginate(q.Match(q.Index("all_todos"))),
          q.Lambda(x => q.Get(x))
        )
      );
      const res1 = await results.data.map(d => {
        return {
          id: d.ts,
          text: d.data.text,
          done: d.data.done,
        }
      })
      return res1;
    }
  },
  Mutation: {
    addTodo: async (_, { text }) => {
      const results = await client.query(
        q.Create(q.Collection("todos"), {
          data: {
            text,
            done: false,
          }
        })
      );
      return {
        ...results.data,
        id: results.ref.id
      };
    },
    updateTodoDone: async (_, { text, done }) => {
      var result = await client.query(
        q.Paginate(q.Match(q.Index('todos_by_text'), text))
      );
      var result2 = await client.query(
        q.Update(result.data[0],{
          data:{
            done:done
          }
        })
      )
      return {
        ...result2.data,
        id: result2.ref.id
      };
    },
    deleteTodo: async (_,{text})=>{
      var result = await client.query(
        q.Paginate(q.Match(q.Index('todos_by_text'), text))
      );
      var result2 = await client.query(
        q.Delete(result.data[0])
      );
      return {
        ...result2.data,
        id: result2.ref.id
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});