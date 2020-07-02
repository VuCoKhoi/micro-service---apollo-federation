const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const DataLoader = require("dataloader");

const getUserLoader = () =>
  new DataLoader(async (ids) => {
    const result = users.find((user) => ids.includes(user.id));

    const mapId = {};
    users.forEach((user) => {
      mapId[user.id] = user;
    });

    return ids.map((id) => mapId[id]);
  });

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    },
  },
  User: {
    __resolveReference: async ({ id }, { userLoader }) => {
      console.log("aaa", await userLoader.load(id), id);
      // return users[0];
      return userLoader.load(id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
  context: ({ req }) => ({
    userLoader: getUserLoader(),
  }),
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada",
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete",
  },
];
