# Connetti Açaí

Aplicativo multiplataforma que conecta produtores e compradores de açaí, facilitando a publicação de ofertas, negociações, mensagens e o acompanhamento de oportunidades de mercado.

O projeto é desenvolvido com React Native e Expo, com uma experiência adaptada ao perfil e às permissões de cada usuário.

## Funcionalidades

- Cadastro e autenticação de usuários;
- Perfis de produtor e comprador;
- Controle de acesso baseado em funções e permissões;
- Listagem e visualização de ofertas de açaí;
- Criação e gerenciamento de ofertas de venda e de compra;
- Negociações entre compradores e produtores;
- Mensagens e acompanhamento de transações;
- Histórico de preços por município e período;
- Localização para publicação e descoberta de ofertas próximas;
- Notificações locais com abertura direta da tela relacionada;
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
- [Zustand](https://zustand.docs.pmnd.rs/);
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/);
- [Lucide Icons](https://lucide.dev/);
- Drizzle ORM e Expo SQLite;
- Expo Location e Expo Notifications.

## Requisitos

Antes de iniciar, instale:

- Node.js 20.19 ou superior;
- npm;
- Android Studio para executar no Android;
- Xcode para executar no iOS, disponível apenas no macOS;
- Expo Go para fluxos básicos ou um development build para testar a integração nativa completa.

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

Copie o arquivo de exemplo para `.env.local`:

```bash
cp .env.local.example .env.local
```

Depois, informe a URL-base da API:

```env
EXPO_PUBLIC_API_URL=https://sua-api.example.com
```

Não inclua uma barra no final da URL. O aplicativo remove barras excedentes e deriva automaticamente o endereço WebSocket, trocando `http` por `ws` e adicionando `/chat`.

A inicialização é interrompida quando `EXPO_PUBLIC_API_URL` não está definida. Variáveis com o prefixo `EXPO_PUBLIC_` são incluídas no aplicativo cliente; não armazene tokens, senhas, chaves privadas ou outros segredos nelas.

Após alterar o arquivo de ambiente, reinicie o servidor de desenvolvimento para garantir que o novo valor seja carregado.

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

Os scripts `android` e `ios` usam `expo run`, geram/atualizam os projetos nativos e instalam um development build no dispositivo ou simulador. Depois da primeira compilação, `npm start` pode ser usado para iniciar somente o bundler.

> No Android, notificações push remotas não funcionam no Expo Go a partir do SDK 53. Este projeto agenda notificações locais, mas prefira um development build para validar o comportamento nativo completo.

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
├── services/            # Serviços do dispositivo, como notificações
├── storage/             # Persistência local do usuário e token
├── styles/              # Estilos e tema global
└── utils/               # Cálculos e transformações compartilhadas
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
| `buyer` | Comprador | Ofertas de compra, consulta de ofertas e negociações |

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

Para conferir se as dependências estão compatíveis com o Expo SDK 54:

```bash
npx expo install --check
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
