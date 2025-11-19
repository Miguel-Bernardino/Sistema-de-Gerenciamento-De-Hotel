# Sistema de Gerenciamento de Hotel

Aplicação web para gerenciamento de quartos, check-ins e status em um hotel, construída com React Router, Vite, TypeScript e Tailwind CSS. Este README descreve como preparar o ambiente, executar em desenvolvimento, gerar build de produção e utilizar Docker.

## 📋 Pré-requisitos

- Node.js >= 20 (recomendado igual à imagem Docker `node:20-alpine`)
- npm (instalado junto com Node)
- Docker (opcional, para containerização)

Verifique versões:
```bash
node -v
npm -v
```

## 📦 Clonando o Projeto

```bash
git clone https://github.com/Miguel-Bernardino/Sistema-de-Gerenciamento-De-Hotel.git
cd Sistema-de-Gerenciamento-De-Hotel
```

## 🛠 Instalação das Dependências

```bash
npm install
```

Se estiver usando CI ou quiser instalação reprodutível mais rápida em ambiente limpo:
```bash
npm ci
```

## 🚀 Ambiente de Desenvolvimento

Inicie o servidor com HMR (Hot Module Replacement):
```bash
npm run dev
```
Acesse: `http://localhost:5173`

### Scripts Disponíveis

| Script | Função |
| ------ | ------ |
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Gera build (SSR + assets) em `build/` |
| `npm run start` | Serve build de produção (usa `react-router-serve`) |
| `npm run typecheck` | Gera types e roda TypeScript para checagem |

## 🧱 Estrutura de Pastas (resumo)
```
app/            # Código fonte principal (componentes, rotas, estilos)
build/          # Saída gerada pelo build (client + server)
Dockerfile      # Build multi-stage para produção
public/         # Assets públicos (se houver)
react-router.config.ts # Configurações do React Router
```

## 🏗 Build de Produção

Gerar build:
```bash
npm run build
```

Executar o servidor sobre o build (porta padrão 3000):
```bash
npm run start
```
Acesse: `http://localhost:3000`

## 🔍 Verificação de Tipos
```bash
npm run typecheck
```

## 🐳 Uso com Docker

Build da imagem multi-stage:
```bash
docker build -t hotel-app .
```
Executar o container expondo a porta 3000:
```bash
docker run --rm -p 3000:3000 hotel-app
```
Acesse: `http://localhost:3000`

### Otimizações Possíveis
- Usar `--platform=linux/amd64` em ambientes ARM se necessário
- Publicar a imagem em um registry: `docker tag hotel-app <seu-registro>/hotel-app:latest && docker push <seu-registro>/hotel-app:latest`

## 🌐 Deploy Manual (Sem Docker)

Copie apenas os arquivos necessários:
```
package.json
package-lock.json
build/
```
Instale dependências de produção:
```bash
npm ci --omit=dev
```
Inicie:
```bash
npm run start
```

## 🎨 Estilos

Tailwind CSS já configurado. Você pode estender a configuração criando arquivo `tailwind.config.js` (se ainda não existir) e adicionando suas regras. Também é possível substituir por outro framework se desejar.

## 📚 Referências
- Documentação React Router: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/

## ✅ Checklist Rápido
- [ ] Node 20+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Rodou `npm run dev` e acessou porta 5173
- [ ] Build gerado (`npm run build`) para produção
- [ ] Servindo em produção local (`npm run start` / Docker)

---