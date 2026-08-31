export const EXAMPLES: { name: string; content: string }[] = [
  {
    name: 'user-profile.json',
    content: JSON.stringify(
      {
        user: {
          id: 'usr_8f3a1c',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          verified: true,
          createdAt: '2023-03-14T09:12:00Z',
          website: 'https://adalovelace.dev',
          preferences: { theme: 'dark', notifications: { email: true, push: false }, accentColor: '#BD93F9' },
        },
        posts: [
          { id: 1, title: 'On the Analytical Engine', tags: ['math', 'computing'], likes: 128 },
          { id: 2, title: 'Notes on Algorithms', tags: ['algorithms'], likes: 342 },
          { id: 3, title: 'First Programs', tags: ['history', 'computing'], likes: 97 },
        ],
        metadata: { version: 2, generated: true, source: null },
      },
      null,
      2
    ),
  },
  {
    name: 'broken-config.json',
    content: `{
  "name": "api-gateway",
  version: "1.4.2",
  "port": 8080,
  "routes": [
    { "path": "/users", "method": "GET" },
    { "path": "/users", "method": "POST", },
  ],
  "database": {
    "host": "localhost,
    "port": 5432
  }
}`,
  },
  {
    name: 'api-response.json',
    content: JSON.stringify(
      {
        status: 'ok',
        data: Array.from({ length: 6 }).map((_, i) => ({
          id: i + 1,
          name: ['John', 'Sarah', 'Miguel', 'Aisha', 'Chen', 'Priya'][i],
          age: 22 + i * 3,
          email: `${['john', 'sarah', 'miguel', 'aisha', 'chen', 'priya'][i]}@example.com`,
        })),
        pagination: { page: 1, perPage: 6, total: 6 },
      },
      null,
      2
    ),
  },
];
