# Connetti Açaí

Aplicativo multiplataforma que conecta produtores e compradores de açaí, facilitando a publicação de ofertas, negociações, mensagens e o acompanhamento de oportunidades de mercado.

O projeto é desenvolvido com React Native e Expo, com uma experiência adaptada ao perfil e às permissões de cada usuário.

## Funcionalidades

- Cadastro e autenticação de usuários;
- Perfis de produtor e comprador;
- Controle de acesso baseado em funções e permissões;
- Listagem e visualização de ofertas de açaí;
- Criação e gerenciamento de ofertas para produtores;
- Negociações entre compradores e produtores;
- Mensagens e acompanhamento de transações;
- Persistência local da sessão;
- Navegação protegida para usuários autenticados.

## Tecnologias

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/);
- [React Native](https://reactnative.dev/);
- [React 19](https://react.dev/);
- [Expo Router](https://docs.expo.dev/router/introduction/);
- [TypeScript](https://www.typescriptlang.org/);
- [Axios](https://axios-http.com/);
- [NativeWind](https://www.nativewind.dev/);
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/);
- [Lucide Icons](https://lucide.dev/);
- Drizzle ORM e Expo SQLite.

## Requisitos

Antes de iniciar, instale:

- Node.js 20.19 ou superior;
- npm;
- Android Studio para executar no Android;
- Xcode para executar no iOS, disponível apenas no macOS;
- Expo Go ou um development build, conforme os recursos utilizados.

## Instalação

Clone o repositório e acesse a pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd collegaacai
```

Instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_API_URL=https://sua-api.example.com
```

Variáveis com o prefixo `EXPO_PUBLIC_` são incluídas no aplicativo cliente. Não armazene tokens, senhas, chaves privadas ou outros segredos nessas variáveis.

> A autenticação atual utiliza a API `https://fastify-auth-api.onrender.com`. Ao centralizar todos os endpoints, prefira configurar a URL-base pelo ambiente.

## Executando o projeto

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Outros comandos disponíveis:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

Para limpar o cache do Metro quando necessário:

```bash
npx expo start --clear
```

## Estrutura principal

```text
src/
├── app/                 # Rotas e telas com Expo Router
│   ├── (tabs)/          # Navegação principal por abas
│   ├── auth/            # Cadastro e autenticação
│   └── pages/           # Fluxos internos protegidos
├── assets/              # Imagens usadas pelas telas
├── auth/                # Regras de perfis e permissões
├── components/          # Componentes reutilizáveis
├── contexts/            # Estado global de autenticação
├── database/            # Configuração do banco local
├── dtos/                # Tipos dos dados da API
├── hooks/               # Hooks de autenticação e acesso
├── server/              # Cliente e configuração HTTP
├── storage/             # Persistência local do usuário e token
└── styles/              # Estilos e tema global
```

## Autenticação

Após o login, os dados do usuário e o token são armazenados no AsyncStorage. O contexto de autenticação restaura a sessão ao iniciar o aplicativo e configura o token Bearer para requisições autenticadas.

As rotas públicas incluem a entrada e o cadastro. As abas e páginas internas ficam disponíveis somente após a autenticação.

## Perfis e controle de acesso

As regras estão centralizadas em:

```text
src/auth/accessControl.ts
```

Os perfis atualmente reconhecidos são:

| Perfil da API | Nome exibido | Principais recursos |
| --- | --- | --- |
| `producer` | Produtor | Criação e gerenciamento de ofertas |
| `buyer` | Comprador | Consulta de ofertas e início de negociações |

O aplicativo considera tanto `roles` quanto `permissions` retornados pela API. Para adicionar um perfil, registre seus aliases em `PROFILE_REGISTRY` e associe o perfil ou suas permissões às funcionalidades em `FEATURE_ACCESS`.

Exemplo:

```ts
export const PROFILE_REGISTRY = {
  producer: {
    label: "Produtor",
    aliases: ["producer", "produtor"],
  },
  buyer: {
    label: "Comprador",
    aliases: ["buyer", "comprador"],
  },
  transporter: {
    label: "Transportador",
    aliases: ["transporter", "transportador"],
  },
} as const
```

O controle no aplicativo melhora a experiência e impede navegação indevida no cliente, mas não substitui a autorização no backend. A API deve validar o token e as permissões em todas as operações protegidas.

## Qualidade do código

Execute a verificação do TypeScript antes de enviar alterações:

```bash
npx tsc --noEmit
```

Também é recomendado verificar problemas de formatação no diff:

```bash
git diff --check
```

## Fluxo de contribuição

1. Crie uma branch para a alteração;
2. Implemente a funcionalidade;
3. Execute as verificações locais;
4. Faça um commit com uma mensagem objetiva;
5. Abra um pull request descrevendo o contexto e os testes realizados.

Exemplo:

```bash
git checkout -b feature/nome-da-funcionalidade
git add .
git commit -m "feat: descreve a funcionalidade"
```

## Status

Projeto em desenvolvimento ativo. Endpoints, telas e regras de negócio podem evoluir conforme a integração com a API.
