## Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  **Install dependencies**

    ```bash
    yarn install
    ```

3.  **Setup Postgres and Redis**
    For a local build, Postgres and Redis clients running locally should suffice and the connection strings in `.env.example` will work.

    To start locally,

    ```bash
    docker compose up --build -d
    ```

    This will start two containers running the databases.

4.  **Set up environment variables**
    Create a `.env` file in the root directory and add necessary environment variables from `.env.example`.

    - Generate Prisma Client:
      ```bash
      yarn prisma:generate
      ```
    - Push schema to database:
      ```bash
      yarn prisma:push
      ```

5.  **Start the development server**
    ```bash
    yarn dev
    ```
    The application should now be running at `http://localhost:3000`.

## Scripts

- `yarn dev`: Run in development mode
- `yarn build`: Build for production
- `yarn start`: Run production build
- `yarn prisma:generate`: Generate Prisma Client
- `yarn prisma:push`: Push schema to database (prototyping)
