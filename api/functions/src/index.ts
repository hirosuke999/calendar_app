import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ApolloServer, gql } from 'apollo-server-cloud-functions'

admin.initializeApp(functions.config().firebase)

const db = admin.firestore()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// const examples = [
//   { id: 1, name: 'exam1', message: 'message1' },
//   { id: 2, name: 'exam2', message: 'message2' },
//   { id: 3, name: 'exam3', message: 'message3' },
// ]

const samples = [
  { id: 1, title: 'sample1', status: 'ok' },
  { id: 2, title: 'sample2', status: 'ok' },
  { id: 3, title: 'sample3', status: 'bad' },
]

const typeDefs = [
  gql`
    type Query {
      examples: [Example]
      samples: [Sample]
    }

    type Example {
      id: ID!
      name: String!
      message: String!
    }

    type Mutation {
      createExample(input: ExampleInput!): Example
    }

    input ExampleInput {
      name: String!
      message: String!
    }
  `,
  gql`
    type Sample {
      id: ID!
      title: String!
      status: String!
    }
  `
]

const resolvers: Array<any> = [
  {
    Query: {
      async examples() {
        const ref = await db.collection('examples').get()
        return ref.docs.map(example => ({
          id: example.id,
          ...example.data()
        }))
      },
    },
    Mutation: {
      async createExample(_: any, args: any) {
        try {
          const ref = await db.collection('examples').add(args.input)
          const example = await ref.get()
          const data = example.data()

          if (!data) throw new Error("Response not found")

          return {
            id: example.id,
            name: data.name,
            message: data.message
          }
        }
        catch (e) {
          console.error(e)
          return {
            errors: {
              message: e.message
            }
          }
        }
      }
    }
  },
  {
    Query: {
      samples: (...params: any[]) => {
        console.debug(params)
        return samples
      }
    }
  }
]

const context = { db }
const server = new ApolloServer({ context, typeDefs, resolvers })

const REGION = 'asia-northeast1'

export const graphql = functions
  .region(REGION)
  .https.onRequest(server.createHandler());
