# AI Food Assistant & Recipe Web App 🍳

An AI-powered food recommendation and recipe web application built with Next.js, TypeScript, and OpenAI. Discover meals, plan diets, and cook efficiently with personalized AI-powered recommendations.

## ✨ Features

- 🤖 **AI Food Assistant**: Chat with an AI to get recipe recommendations, cooking tips, and meal ideas
- 🍲 **Recipe Generator**: Generate step-by-step recipes from ingredients you have. Includes prep time, cook time, and nutritional info
- 👤 **Personalized Recommendations**: Get recipe suggestions based on your diet preferences, health goals, and cuisine preferences
- 🛒 **Smart Grocery List**: Create and manage shopping lists with categories. Mark items as bought and track your progress
- 📅 **Meal Planner**: Plan your meals for the week with an interactive calendar. Add breakfast, lunch, dinner, and snacks
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
   - Copy `env.example` to `.env.local`
   - Add your OpenAI API key:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (GPT-4 Turbo)
- **UI Icons**: Lucide React
- **Date Utilities**: date-fns

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # AI assistant endpoint
│   │   ├── generate-recipe/  # Recipe generation endpoint
│   │   └── recommendations/  # Personalized recommendations endpoint
│   ├── assistant/        # AI Assistant page
│   ├── recipes/          # Recipes & Recipe Generator pages
│   ├── planner/          # Meal Planner page
│   ├── grocery/          # Grocery List page
│   └── recommendations/  # Personalized Recommendations page
├── components/
│   └── Navigation.tsx    # Main navigation component
└── public/               # Static assets
```

## 🎯 Usage Examples

### AI Assistant
- "What can I cook with eggs, tomatoes, and onions?"
- "Suggest a healthy dinner under 500 calories"
- "I'm vegetarian, give me high-protein lunch ideas"

### Recipe Generator
- Add your available ingredients
- Select diet type (vegan, keto, etc.) and cuisine
- Generate a complete recipe with instructions and nutrition info

### Meal Planner
- Plan your meals for the week
- Add breakfast, lunch, dinner, and snacks
- Set specific times for meals

### Grocery List
- Add items by category
- Mark items as bought
- Track shopping progress

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## 📝 Features Roadmap

- [ ] Voice interaction support
- [ ] Image recognition for ingredients
- [ ] Community recipes and sharing
- [ ] Integration with grocery delivery APIs
- [ ] Mobile app (React Native)
- [ ] Recipe bookmarking and favorites
- [ ] Cooking timer integration
- [ ] Nutritional tracking over time

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for learning or building your own food app!

## 🙏 Acknowledgments

- OpenAI for the GPT-4 API
- Next.js team for the amazing framework
- All the open-source libraries used in this project
