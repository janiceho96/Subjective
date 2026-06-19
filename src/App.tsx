import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Brain,
  Cpu,
  Compass,
  Plus,
  Trash2,
  Download,
  Edit3,
  Search,
  X,
  Tag,
  BookOpen,
  Eye,
  Calendar,
  ExternalLink,
  BookMarked,
  Sun,
  Moon,
  Star
} from 'lucide-react'
import './KnowledgeApp.css'

// Types
interface Subject {
  id: string
  name: string
  emoji: string
  color: 'lavender' | 'mint' | 'peach' | 'rose' | 'sky' | 'lemon'
}

interface KnowledgeCard {
  id: string
  subjectId: string
  title: string
  emoji: string
  summary: string
  content: string
  tags: string[]
  dateAdded: string
  starred?: boolean
}


// Initial Subjects
const initialSubjects: Subject[] = [
  { id: 'sub-psy', name: 'Psychology', emoji: '🧠', color: 'rose' },
  { id: 'sub-ai', name: 'Artificial Intelligence', emoji: '🤖', color: 'lavender' },
  { id: 'sub-phil', name: 'Philosophy', emoji: '🏛️', color: 'sky' }
]

// Initial 15 Cards (5 for each subject)
const initialCards: KnowledgeCard[] = [
  // Psychology Examples
  {
    id: 'psy-1',
    subjectId: 'sub-psy',
    title: 'Cognitive Dissonance',
    emoji: '💭',
    summary: 'The mental discomfort that results from holding two conflicting beliefs, values, or attitudes.',
    content: `Coined by Leon Festinger in 1957. People tend to seek consistency in their beliefs and perceptions. 

When there is a discrepancy between beliefs or behaviors (dissonance), individuals feel uncomfortable and are motivated to reduce this tension. They do this by:
1. Changing their behavior (e.g., stopping smoking).
2. Changing their conflicting belief (e.g., "smoking isn't that bad").
3. Justifying their behavior by adding new beliefs (e.g., "it keeps me relaxed").`,
    tags: ['cognition', 'behavior', 'festinger'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'psy-2',
    subjectId: 'sub-psy',
    title: 'Growth Mindset',
    emoji: '🌱',
    summary: 'The belief that abilities and intelligence can be developed through dedication, hard work, and learning.',
    content: `Popularized by psychologist Carol Dweck in her research on motivation and development.

Key comparisons:
* Fixed Mindset: Believes intelligence and talent are static traits that cannot be changed. Leads to a desire to look smart, avoiding challenges, and giving up easily.
* Growth Mindset: Believes basic abilities can be developed through dedication. Leads to a love of learning, embracing challenges, persisting in setbacks, and viewing effort as the path to mastery.`,
    tags: ['mindset', 'motivation', 'dweck'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'psy-3',
    subjectId: 'sub-psy',
    title: 'Bystander Effect',
    emoji: '👥',
    summary: 'A social psychological phenomenon where individuals are less likely to help a victim if others are present.',
    content: `First demonstrated in laboratories by John Darley and Bibb Latané in 1968 following the tragic murder of Kitty Genovese.

The effect is driven by two main cognitive processes:
1. Diffusion of Responsibility: Because others are present, individuals do not feel as much pressure to take action, assuming someone else will step up or has already called for help.
2. Social Influence (Pluralistic Ignorance): Bystanders monitor the reactions of others to determine if it is a true emergency. If no one else is reacting, individuals assume the situation is not critical.`,
    tags: ['social', 'group-dynamics', 'behavior'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'psy-4',
    subjectId: 'sub-psy',
    title: 'Pavlovian Conditioning',
    emoji: '🐶',
    summary: 'A learning process that occurs when a neutral stimulus is repeatedly paired with a naturally potent stimulus.',
    content: `Also known as Classical Conditioning. Discovered accidentally by Ivan Pavlov during research on canine digestion.

The setup:
1. Unconditioned Stimulus (UCS): Food -> naturally triggers Unconditioned Response (UCR): Salivation.
2. Neutral Stimulus (NS): Metronome/Bell -> triggers no response.
3. Conditioning Phase: Pair NS (Bell) + UCS (Food) repeatedly.
4. Conditioned Stimulus (CS): Bell -> triggers Conditioned Response (CR): Salivation (even without food present).`,
    tags: ['learning', 'behavioral', 'pavlov'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'psy-5',
    subjectId: 'sub-psy',
    title: "Maslow's Hierarchy of Needs",
    emoji: '🔺',
    summary: 'A motivational theory mapping five tiers of human needs, from basic survival to self-actualization.',
    content: `Introduced by Abraham Maslow in 1943. Needs lower down in the hierarchy must be satisfied before individuals can attend to needs higher up.

From base to peak:
1. Physiological Needs: Food, water, warmth, rest.
2. Safety Needs: Security, safety, shelter.
3. Belongingness and Love: Intimate relationships, friends.
4. Esteem Needs: Prestige and feeling of accomplishment.
5. Self-Actualization: Achieving one's full potential, including creative activities.`,
    tags: ['motivation', 'needs', 'humanistic'],
    dateAdded: '2026-06-19'
  },

  // AI Examples
  {
    id: 'ai-1',
    subjectId: 'sub-ai',
    title: 'Neural Networks & Deep Learning',
    emoji: '🧬',
    summary: 'A class of machine learning models inspired by the network structure of biological brain neurons.',
    content: `Neural networks form the backbone of modern Deep Learning. 

Key Components:
* Input Layer: Receives input features (e.g., pixels of an image).
* Hidden Layers: Interconnected nodes (artificial neurons) that apply weights and biases. They capture complex, non-linear relationships.
* Output Layer: Produces final predictions (e.g., classification label: "Cat").
* Backpropagation: The mathematical process of updating the weights and biases based on the loss (error) function output using calculus (gradient descent).`,
    tags: ['deep-learning', 'networks', 'math'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'ai-2',
    subjectId: 'sub-ai',
    title: 'Large Language Models (LLMs)',
    emoji: '💬',
    summary: 'AI systems trained on massive text corpora to predict tokens and generate coherent natural language.',
    content: `Modern LLMs rely heavily on the Transformer Architecture (introduced in the 2017 paper "Attention Is All You Need").

How they work:
1. Tokenization: Text is broken into smaller chunks (words or sub-words).
2. Embeddings: Tokens are converted into dense vector spaces capturing meaning.
3. Self-Attention: The model assesses how important other words in a sentence are relative to a specific target word, letting it capture contextual cues over long ranges.
4. Autoregressive Generation: It generates text one token at a time, predicting the next most probable word based on all preceding words.`,
    tags: ['transformers', 'nlp', 'generative-ai'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'ai-3',
    subjectId: 'sub-ai',
    title: 'Reinforcement Learning',
    emoji: '🎮',
    summary: 'A training methodology based on rewarding desired behaviors and punishing undesired ones.',
    content: `An agent learns to behave in an environment by performing actions and seeing the results.

Core Loop:
1. The Agent observes the current State of the environment.
2. The Agent takes an Action based on a policy.
3. The Environment responds by transitioning to a new State and providing a Reward (positive or negative).
4. The Agent updates its policy to maximize cumulative future rewards (often using Q-learning or Policy Gradients).

Famous applications: AlphaGo, robotic locomotion, game-playing AIs (Atari, Dota 2).`,
    tags: ['rl', 'agents', 'gaming'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'ai-4',
    subjectId: 'sub-ai',
    title: 'The Turing Test',
    emoji: '👤',
    summary: 'A historical test of a machine\'s ability to exhibit intelligent behavior indistinguishable from a human.',
    content: `Proposed by Alan Turing in 1950 in his paper "Computing Machinery and Intelligence". Turing called it the "Imitation Game".

The Setup:
* A human judge engages in text-only conversations with two entities: one human and one computer.
* The judge does not know which is which.
* If the judge cannot reliably tell the machine from the human after a set period, the machine passes the test.

Modern interpretation: Rather than assessing "true consciousness," it tests behavioral emulation of human language.`,
    tags: ['history', 'turing', 'philosophy'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'ai-5',
    subjectId: 'sub-ai',
    title: 'Overfitting vs. Underfitting',
    emoji: '📉',
    summary: 'The critical modeling issues of failing to generalize or failing to capture structural patterns.',
    content: `The ultimate goal of training an AI model is generalizability—performing well on new, unseen test data.

Two failure states:
* Overfitting: The model learns the training data, including its random noise, too well. High accuracy on training data but poor performance on test data.
  * Remedy: Simplify model, use regularization, add dropout, or gather more training data.
* Underfitting: The model is too simple to learn the underlying patterns. Poor performance on both training and testing datasets.
  * Remedy: Train longer, use a larger model, or extract better features.`,
    tags: ['modeling', 'training', 'validation'],
    dateAdded: '2026-06-19'
  },

  // Philosophy Examples
  {
    id: 'phil-1',
    subjectId: 'sub-phil',
    title: 'Stoicism & Dichotomy of Control',
    emoji: '🏛️',
    summary: 'The ancient practice of distinguishing between what is up to us and what is not.',
    content: `Promoted by Stoic philosophers like Epictetus, Marcus Aurelius, and Seneca.

The fundamental rule:
* Things inside our control: Our opinions, aspirations, desires, and avoidances—our own actions and choices.
* Things outside our control: Our bodies (health/sickness), reputation, wealth, birth, death, and the behaviors of other people.

Stoicism teaches that unhappiness arises from attempting to control what is outside of us, or failing to take ownership of what is within our power.`,
    tags: ['stoicism', 'control', 'ethics'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'phil-2',
    subjectId: 'sub-phil',
    title: 'Utilitarianism',
    emoji: '⚖️',
    summary: 'An ethical philosophy proposing that actions are right if they maximize overall happiness or utility.',
    content: `Formulated by Jeremy Bentham and refined by John Stuart Mill in the 19th century.

Key principles:
1. Consequentialism: The moral worth of an action is judged solely by its consequences.
2. The Greatest Happiness Principle: Actions are moral to the extent that they promote the greatest happiness for the greatest number of people.
3. Utility: The production of pleasure, good, or prevention of pain.

Common criticism: Can justify sacrificing the rights of a minority for the happiness of the majority (e.g., the trolley problem).`,
    tags: ['ethics', 'utilitarianism', 'morals'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'phil-3',
    subjectId: 'sub-phil',
    title: 'The Allegory of the Cave',
    emoji: '🕯️',
    summary: 'Plato\'s metaphor describing how human perceptions can mistake shadows for absolute reality.',
    content: `Presented in Plato's "Republic" to illustrate the effect of education and the lack of it on our nature.

The story:
1. Prisoners are chained in a dark cave facing a wall, unable to turn their heads.
2. Behind them, a fire burns. Puppeteers walk carrying objects, casting shadows on the wall.
3. The prisoners see the shadows and believe them to be real objects (physical reality).
4. One prisoner is freed, climbs out of the cave, is blinded by the sun (Forms/Truth), and realizes the cave shadows were just illusions.
5. He returns to free the others, but they mock him and refuse to leave, comfortable in their familiar ignorance.`,
    tags: ['plato', 'reality', 'epistemology'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'phil-4',
    subjectId: 'sub-phil',
    title: 'Nihilism vs. Absurdism',
    emoji: '🌌',
    summary: 'Existential stances dealing with the search for purpose in a silent, indifferent universe.',
    content: `Both philosophies agree that there is no pre-determined, inherent meaning to human existence.

The divergence:
* Nihilism: Argues that life has no objective meaning. Some forms suggest that subjective meaning is also a hollow delusion. Historically associated with Friedrich Nietzsche (who wrote about overcoming it).
* Absurdism: Coined by Albert Camus. Focuses on the "Absurd"—the conflict between humanity's desperate search for meaning and the cold indifference of the universe. Camus argues we must not flee into religion (philosophical suicide) nor physical suicide, but accept the absurd and live defiantly with passion.`,
    tags: ['existentialism', 'camus', 'nietzsche'],
    dateAdded: '2026-06-19'
  },
  {
    id: 'phil-5',
    subjectId: 'sub-phil',
    title: 'Descartes: Cogito, Ergo Sum',
    emoji: '✍️',
    summary: '"I think, therefore I am"—the starting point of modern Western epistemology.',
    content: `Formulated by René Descartes in 1937 ("Discourse on the Method") and expanded in his "Meditations".

Descartes' Radical Doubt method:
* He decided to doubt absolutely everything—his senses, memory, even math (hypothesizing an "evil demon" deceiving him).
* He searched for one absolute truth that could not be doubted.
* He realized that the very act of doubting (thinking) required a thinker. He could not doubt his own existence while he was doubting.
* Therefore, the existence of thought guarantees the existence of the thinking self.`,
    tags: ['descartes', 'skeptical', 'existence'],
    dateAdded: '2026-06-19'
  }
]

// Helper function to parse and render simple markdown
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null

  const lines = text.split('\n')
  const resultElements: React.ReactNode[] = []
  
  let inCodeBlock = false
  let codeBlockContent: string[] = []
  let codeLanguage = ''
  let inList = false
  let listItems: React.ReactNode[] = []

  const parseInline = (lineText: string, keyPrefix: string): React.ReactNode[] => {
    const parts = lineText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    return parts.map((part, idx) => {
      const key = `${keyPrefix}-${idx}`
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={key}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={key} className="cute-code">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  const flushList = (index: number) => {
    if (listItems.length > 0) {
      resultElements.push(
        <ul key={`list-${index}`} className="cute-md-list">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        resultElements.push(
          <pre key={`codeblock-${i}`} className="cute-pre-code">
            {codeLanguage && <span className="lang-tag">{codeLanguage}</span>}
            <code className="cute-code-body">{codeBlockContent.join('\n')}</code>
          </pre>
        )
        inCodeBlock = false
        codeBlockContent = []
        codeLanguage = ''
      } else {
        flushList(i)
        inCodeBlock = true
        codeLanguage = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    if (line.startsWith('### ')) {
      flushList(i)
      const headerText = line.slice(4)
      resultElements.push(
        <h4 key={`h3-${i}`} className="cute-md-h3">
          {parseInline(headerText, `h3-${i}`)}
        </h4>
      )
      continue
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true
      const cleanLine = line.trim().slice(2)
      listItems.push(
        <li key={`li-${i}`} className="cute-md-li">
          {parseInline(cleanLine, `li-${i}`)}
        </li>
      )
      continue
    } else if (inList && line.trim() === '') {
      flushList(i)
      continue
    } else if (inList && !line.startsWith('  ') && !line.startsWith('\t')) {
      flushList(i)
    }

    if (line.trim() === '') {
      resultElements.push(<div key={`br-${i}`} className="cute-md-br" />)
    } else {
      resultElements.push(
        <p key={`p-${i}`} className="cute-md-p">
          {parseInline(line, `p-${i}`)}
        </p>
      )
    }
  }

  flushList(lines.length)

  return <div className="markdown-body">{resultElements}</div>
}

// Helper function to highlight text matching the search query
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) return text

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, idx) => 
        regex.test(part) ? (
          <mark key={idx} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function App() {
  // Load initial data or fetch from local storage
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('knowledge_subjects')
    return saved ? JSON.parse(saved) : initialSubjects
  })

  const [cards, setCards] = useState<KnowledgeCard[]>(() => {
    const saved = localStorage.getItem('knowledge_cards')
    return saved ? JSON.parse(saved) : initialCards
  })

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('knowledge_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    localStorage.setItem('knowledge_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  // States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [chatImportSubjectId, setChatImportSubjectId] = useState<string>('')

  // Reset tag filter and sync chat import subject when selectedSubjectId changes
  useEffect(() => {
    setSelectedTag(null)
    if (selectedSubjectId !== 'all' && selectedSubjectId !== 'starred') {
      setChatImportSubjectId(selectedSubjectId)
    } else if (subjects.length > 0) {
      setChatImportSubjectId(subjects[0].id)
    }
  }, [selectedSubjectId, subjects])
  
  // Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [viewingCard, setViewingCard] = useState<KnowledgeCard | null>(null)
  
  // AI Explainer states
  const [aiExplanation, setAiExplanation] = useState<string>('')
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string>('')
  const [editingCard, setEditingCard] = useState<KnowledgeCard | null>(null)

  // Study Mode states
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false)
  const [studyCards, setStudyCards] = useState<KnowledgeCard[]>([])
  const [currentStudyIndex, setCurrentStudyIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)

  // AI Chat helper states
  const [isChatMode, setIsChatMode] = useState<boolean>(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>(() => {
    const saved = localStorage.getItem('knowledge_chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [chatInput, setChatInput] = useState<string>('')
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false)
  const [chatError, setChatError] = useState<string>('')

  // Document Analyzer states
  const [showDocAnalyzer, setShowDocAnalyzer] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [cardsCountToGenerate, setCardsCountToGenerate] = useState<number>(5)
  const [focusPrompt, setFocusPrompt] = useState<string>('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Form states - Subject
  const [newSubName, setNewSubName] = useState('')
  const [newSubEmoji, setNewSubEmoji] = useState('📚')
  const [newSubColor, setNewSubColor] = useState<'lavender' | 'mint' | 'peach' | 'rose' | 'sky' | 'lemon'>('lavender')

  // Form states - Card
  const [cardSubjectId, setCardSubjectId] = useState('')
  const [cardTitle, setCardTitle] = useState('')
  const [cardEmoji, setCardEmoji] = useState('💡')
  const [cardSummary, setCardSummary] = useState('')
  const [cardContent, setCardContent] = useState('')
  const [cardTagsString, setCardTagsString] = useState('')

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('knowledge_subjects', JSON.stringify(subjects))
  }, [subjects])

  useEffect(() => {
    localStorage.setItem('knowledge_cards', JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    localStorage.setItem('knowledge_chat_history', JSON.stringify(chatMessages))
  }, [chatMessages])

  // Reset AI states when viewingCard changes
  useEffect(() => {
    setAiExplanation('')
    setIsAiLoading(false)
    setAiError('')
  }, [viewingCard])

  // Fetch AI explanation
  const handleAiExplain = async () => {
    if (!viewingCard) return
    setIsAiLoading(true)
    setAiError('')
    setAiExplanation('')

    try {
      const response = await window.electronAPI.explainCard(
        viewingCard.title,
        viewingCard.summary,
        viewingCard.content
      )
      if (response.error) {
        setAiError(response.error)
      } else if (response.content) {
        setAiExplanation(response.content)
      } else {
        setAiError('No explanation was returned.')
      }
    } catch (err) {
      setAiError('Failed to communicate with Electron main process.')
    } finally {
      setIsAiLoading(false)
    }
  }

  // Study Mode controllers
  const startStudyMode = () => {
    const cardsToStudy = filteredCards
    if (cardsToStudy.length === 0) return
    const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5)
    setStudyCards(shuffled)
    setCurrentStudyIndex(0)
    setIsFlipped(false)
    setIsStudyMode(true)
  }

  const exitStudyMode = () => {
    setIsStudyMode(false)
    setStudyCards([])
    setCurrentStudyIndex(0)
    setIsFlipped(false)
  }

  const resetStudyDeck = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5)
    setStudyCards(shuffled)
    setCurrentStudyIndex(0)
    setIsFlipped(false)
  }

  const handleStudyAgain = () => {
    const currentCard = studyCards[currentStudyIndex]
    const updated = [...studyCards]
    updated.push(currentCard) // add to the end
    setStudyCards(updated)
    setCurrentStudyIndex(currentStudyIndex + 1)
    setIsFlipped(false)
  }

  const handleStudyGotIt = () => {
    setCurrentStudyIndex(currentStudyIndex + 1)
    setIsFlipped(false)
  }

  // AI Chat controller functions
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = { role: 'user' as const, content: chatInput.trim() }
    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    setChatInput('')
    setIsChatLoading(true)
    setChatError('')

    // System context prep
    const activeCards = selectedSubjectId === 'all' ? cards : cards.filter(c => c.subjectId === selectedSubjectId)
    const deckSummary = activeCards.map(c => `- ${c.title} (${c.emoji}): ${c.summary}`).join('\n')
    const activeSubName = selectedSubjectId === 'all' ? 'All Subjects' : (activeSubject?.name || 'General Knowledge')

    const systemPrompt = `You are a helpful AI Study Buddy inside the Subjective Knowledge App. 
Your goal is to help the user learn about their subjects, explain concepts, ask questions, and build cards.

The user is currently studying the subject: "${activeSubName}".
Here are the existing cards in their deck for this subject:
${deckSummary || '(No cards in this deck yet.)'}

INSTRUCTION FOR GENERATING CARDS AND SUBJECTS:
1. If you explain a new concept, define a term, or summarize an interesting idea, you should suggest a new knowledge card for the user.
2. If the user asks about or wants to learn a completely new subject or field of study that is not in their subjects list, you should suggest creating a new subject. You can optionally package an initial card inside that suggestion.

To do this, output a single JSON block at the very end of your response inside a markdown code block labeled with \`json\` containing the card details. 
The JSON schema MUST follow:
{
  "suggestedSubject": {
    "name": "Subject Name", (the name of the suggested subject)
    "emoji": "🪐", (a highly relevant subject emoji)
    "color": "sky" (choose from: 'lavender', 'mint', 'peach', 'rose', 'sky', 'lemon')
  }, (optional: only include if proposing a new subject folder)
  "title": "Title of the concept",
  "summary": "A concise one-sentence key takeaway",
  "content": "Detailed explanation, lists, examples, or equations",
  "tags": ["tag1", "tag2"],
  "emoji": "💡" (choose a highly relevant card emoji)
}
Only output the suggested JSON inside a code block at the end. Do not write anything after the code block.`

    try {
      const response = await window.electronAPI.aiChat(
        updatedMessages,
        systemPrompt
      )

      if (response.error) {
        setChatError(response.error)
      } else if (response.content) {
        setChatMessages([...updatedMessages, { role: 'assistant' as const, content: response.content }])
      } else {
        setChatError('No response returned from AI helper.')
      }
    } catch (err) {
      setChatError('Failed to communicate with Electron main process.')
    } finally {
      setIsChatLoading(false)
    }
  }

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      setChatMessages([])
      localStorage.removeItem('knowledge_chat_history')
    }
  }

  const handleDocumentAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || isParsing || isChatLoading) return

    setIsParsing(true)
    setChatError('')

    try {
      const filePath = (selectedFile as any).path
      if (!filePath) {
        setChatError('Could not retrieve local file path. Make sure you are running in the Electron app.')
        setIsParsing(false)
        return
      }

      const parseRes = await window.electronAPI.parseDocument(filePath)
      if (parseRes.error) {
        setChatError(`Failed to parse document: ${parseRes.error}`)
        setIsParsing(false)
        return
      }

      const extractedText = parseRes.content || ''
      if (!extractedText.trim()) {
        setChatError('Extracted document content is empty.')
        setIsParsing(false)
        return
      }

      setIsParsing(false)
      setIsChatLoading(true)

      const targetSubName = selectedSubjectId === 'all' 
        ? (subjects.find(s => s.id === chatImportSubjectId)?.name || 'General')
        : (activeSubject?.name || 'General')

      const userMsg = {
        role: 'user' as const,
        content: `📖 Attached Document: "${selectedFile.name}" (${(selectedFile.size / 1024).toFixed(1)} KB)\nAction: Extract exactly ${cardsCountToGenerate} cards. Target Subject: ${targetSubName}.${focusPrompt ? `\nFocus instruction: "${focusPrompt}"` : ''}`
      }
      
      const updatedMessages = [...chatMessages, userMsg]
      setChatMessages(updatedMessages)

      // Truncate file content to save tokens
      const truncatedText = extractedText.length > 25000
        ? extractedText.substring(0, 25000) + '\n... [Document text truncated for size] ...'
        : extractedText

      const docContext = `You are a helpful AI Study Buddy inside the Subjective Knowledge App.
The user has attached a document: "${selectedFile.name}".
Here is the text content extracted from the document:
--- START OF DOCUMENT CONTENT ---
${truncatedText}
--- END OF DOCUMENT CONTENT ---

Analyze this document and extract exactly ${cardsCountToGenerate} key concepts, ideas, or knowledge points.
Generate high-quality flashcards for the subject: "${targetSubName}".
${focusPrompt ? `Focus Instruction: ${focusPrompt}` : ''}

You MUST format your response in two parts:
1. A brief overview/analysis of what the document covers and its core messages.
2. A single JSON array inside a markdown code block labeled with \`json\` at the very end of your response, containing exactly ${cardsCountToGenerate} cards.

JSON Schema for the array:
[
  {
    "title": "Concept Name",
    "summary": "Brief 1-sentence takeaway",
    "content": "Detailed notes, definitions, examples, or markdown structure",
    "tags": ["tag1", "tag2"],
    "emoji": "💡"
  },
  ...
]

Do not write any text after the JSON block.`

      const response = await window.electronAPI.aiChat(
        [{ role: 'user', content: `Please extract ${cardsCountToGenerate} cards from the attached document.` }],
        docContext
      )

      if (response.error) {
        setChatError(response.error)
      } else if (response.content) {
        setChatMessages([...updatedMessages, { role: 'assistant' as const, content: response.content }])
        // Reset analyzer state on success
        setSelectedFile(null)
        setFocusPrompt('')
        setShowDocAnalyzer(false)
      } else {
        setChatError('No response returned from AI helper.')
      }
    } catch (err: any) {
      setChatError(`Failed to process document: ${err.message || err}`)
    } finally {
      setIsChatLoading(false)
      setIsParsing(false)
    }
  }

  // Parse suggested card JSON block from message markdown, repairing if truncated
  const extractSuggestedCard = (content: string) => {
    try {
      const jsonPrefix = '```json'
      const startIndex = content.indexOf(jsonPrefix)
      if (startIndex === -1) return null

      const rawJsonStart = startIndex + jsonPrefix.length
      let endIndex = content.indexOf('```', rawJsonStart)
      
      let jsonString = ''
      if (endIndex !== -1) {
        jsonString = content.substring(rawJsonStart, endIndex).trim()
      } else {
        jsonString = content.substring(rawJsonStart).trim()
      }

      try {
        const cardData = JSON.parse(jsonString)
        if (
          (cardData.title && cardData.summary) || 
          cardData.suggestedSubject ||
          (Array.isArray(cardData) && cardData.length > 0 && cardData[0].title && cardData[0].summary)
        ) {
          return cardData
        }
      } catch (parseErr) {
        const repaired = repairTruncatedJSON(jsonString)
        const cardData = JSON.parse(repaired)
        if (
          (cardData.title && cardData.summary) || 
          cardData.suggestedSubject ||
          (Array.isArray(cardData) && cardData.length > 0 && cardData[0].title && cardData[0].summary)
        ) {
          return cardData
        }
      }
    } catch (e) {
      // Fallback failed
    }
    return null
  }

  // Repair unclosed quotes, brackets, and braces from truncated JSON strings
  const repairTruncatedJSON = (jsonStr: string): string => {
    let repaired = jsonStr.trim()
    
    let openBraces = 0
    let openBrackets = 0
    let inString = false
    let escape = false

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i]
      if (escape) {
        escape = false
        continue
      }
      if (char === '\\') {
        escape = true
        continue
      }
      if (char === '"') {
        inString = !inString
        continue
      }
      if (!inString) {
        if (char === '{') openBraces++
        else if (char === '}') openBraces--
        else if (char === '[') openBrackets++
        else if (char === ']') openBrackets--
      }
    }

    if (inString) {
      repaired += '"'
    }
    
    while (openBrackets > 0) {
      repaired += ']'
      openBrackets--
    }

    while (openBraces > 0) {
      repaired += '}'
      openBraces--
    }

    return repaired
  }

  const handleSaveSuggestedCard = (cardData: any, importSubjectId?: string) => {
    const targetSubId = importSubjectId || (selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || 'sub-psy'))
    
    if (Array.isArray(cardData)) {
      const newCardsList = cardData.map((item, index) => ({
        id: `card-${Date.now() + index}`,
        subjectId: targetSubId,
        title: item.title.trim(),
        emoji: item.emoji || '💡',
        summary: item.summary.trim(),
        content: item.content || '',
        tags: Array.isArray(item.tags) ? item.tags.map((t: string) => t.trim().toLowerCase()) : [],
        dateAdded: new Date().toISOString().split('T')[0]
      }))
      setCards(prevCards => [...newCardsList, ...prevCards])
      alert(`${newCardsList.length} cards successfully added to your deck! 🎉`)
      return
    }

    const newCard: KnowledgeCard = {
      id: `card-${Date.now()}`,
      subjectId: targetSubId,
      title: cardData.title.trim(),
      emoji: cardData.emoji || '💡',
      summary: cardData.summary.trim(),
      content: cardData.content || '',
      tags: Array.isArray(cardData.tags) ? cardData.tags.map((t: string) => t.trim().toLowerCase()) : [],
      dateAdded: new Date().toISOString().split('T')[0]
    }

    setCards(prevCards => [newCard, ...prevCards])
    alert(`Card "${newCard.title}" successfully added to your deck! 🎉`)
  }

  const handleCreateAndOpenSubject = (subjectData: any, cardData?: any) => {
    if (!subjectData || !subjectData.name) return

    // Check if subject already exists
    let existingSub = subjects.find(s => s.name.toLowerCase() === subjectData.name.toLowerCase())
    let subId = ''

    if (existingSub) {
      subId = existingSub.id
    } else {
      // Create new subject
      subId = `sub-${Date.now()}`
      const newSubject: Subject = {
        id: subId,
        name: subjectData.name.trim(),
        emoji: subjectData.emoji || '📚',
        color: subjectData.color || 'lavender'
      }
      setSubjects(prevSubjects => [...prevSubjects, newSubject])
    }

    // Open/Select the subject
    setSelectedSubjectId(subId)

    // Save card if it is bundled
    if (cardData && cardData.title) {
      const newCard: KnowledgeCard = {
        id: `card-${Date.now() + 1}`,
        subjectId: subId,
        title: cardData.title.trim(),
        emoji: cardData.emoji || '💡',
        summary: cardData.summary.trim(),
        content: cardData.content || '',
        tags: Array.isArray(cardData.tags) ? cardData.tags.map((t: string) => t.trim().toLowerCase()) : [],
        dateAdded: new Date().toISOString().split('T')[0]
      }
      setCards(prevCards => [newCard, ...prevCards])
      alert(`Subject "${subjectData.name}" created and opened! Initial card "${newCard.title}" added to your deck. 🪐🎉`)
    } else {
      alert(`Subject "${subjectData.name}" created and opened! 🪐🎉`)
    }
  }

  // Emojis lists for selector
  const subjectEmojis = [
    '🧠', '🤖', '🏛️', '🎨', '🪐', '🧬', '🔬', '🌱', '🌍', '📐', '✍️', '🎭', '🎼', '⚔️', '🕯️', '🧩',
    '💻', '📊', '📈', '🧘', '🍕', '🐱', '🐶', '🦊', '🦄', '🦖', '🌟', '🍀', '💡', '📚', '🎒', '🎸',
    '🎮', '🍿', '✈️', '⛵', '🏔️', '⛺', '🔑', '🎯', '⌛', '🔔', '💬', '❤️', '💼', '🔨', '🛒'
  ]
  const cardEmojis = [
    '💡', '💭', '🌱', '👥', '🐶', '🔺', '🧬', '💬', '🎮', '👤', '📉', '🏛️', '⚖️', '🕯️', '🌌', '✍️',
    '✨', '🔑', '🚀', '🔥', '📚', '🧩', '📣', '🛡️', '⚙️', '🛠️', '💻', '🖥️', '📡', '🔋', '🔌', '📁',
    '📌', '📅', '📝', '✏️', '🔍', '🔒', '🔓', '🧪', '🔭', '🩺', '💊', '🌡️', '⚡', '🌈', '☀️',
    '🌙', '⭐', '🎈', '🎉', '🏆', '💎', '💰', '✉️', '📦', '📤', '📥', '📍', '🗺️', '🎯', '🎲'
  ]

  // Handle adding new subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubName.trim()) return

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      emoji: newSubEmoji,
      color: newSubColor
    }

    setSubjects([...subjects, newSubject])
    setNewSubName('')
    setNewSubEmoji('📚')
    setNewSubColor('lavender')
    setIsSubjectModalOpen(false)
  }

  // Handle deleting a subject (and its cards)
  const handleDeleteSubject = (subId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the subject "${name}"? This will also delete all of its cards!`)) {
      setSubjects(subjects.filter(s => s.id !== subId))
      setCards(cards.filter(c => c.subjectId !== subId))
      if (selectedSubjectId === subId) {
        setSelectedSubjectId('all')
      }
    }
  }

  // Setup form for adding a card
  const openAddCardModal = () => {
    setEditingCard(null)
    setCardSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : (subjects[0]?.id || ''))
    setCardTitle('')
    setCardEmoji('💡')
    setCardSummary('')
    setCardContent('')
    setCardTagsString('')
    setIsCardModalOpen(true)
  }

  // Setup form for editing an existing card
  const openEditCardModal = (card: KnowledgeCard, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click trigger
    setEditingCard(card)
    setCardSubjectId(card.subjectId)
    setCardTitle(card.title)
    setCardEmoji(card.emoji)
    setCardSummary(card.summary)
    setCardContent(card.content)
    setCardTagsString(card.tags.join(', '))
    setIsCardModalOpen(true)
  }

  // Handle submitting card form (Add or Edit)
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardSubjectId || !cardTitle.trim()) {
      alert('Please fill in the Subject and Title!')
      return
    }

    const processedTags = cardTagsString
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)

    if (editingCard) {
      // Edit
      const updated = cards.map(c => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            subjectId: cardSubjectId,
            title: cardTitle.trim(),
            emoji: cardEmoji,
            summary: cardSummary.trim(),
            content: cardContent.trim(),
            tags: processedTags
          }
        }
        return c
      })
      setCards(updated)
    } else {
      // Add
      const newCard: KnowledgeCard = {
        id: `card-${Date.now()}`,
        subjectId: cardSubjectId,
        title: cardTitle.trim(),
        emoji: cardEmoji,
        summary: cardSummary.trim(),
        content: cardContent.trim(),
        tags: processedTags,
        dateAdded: new Date().toISOString().split('T')[0]
      }
      setCards([newCard, ...cards])
    }

    setIsCardModalOpen(false)
    setEditingCard(null)
  }

  // Handle card deletion
  const handleDeleteCard = (cardId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Delete card "${title}"?`)) {
      setCards(cards.filter(c => c.id !== cardId))
      if (viewingCard && viewingCard.id === cardId) {
        setViewingCard(null)
      }
    }
  }

  // Toggle card starred status
  const toggleStarCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = cards.map(c => {
      if (c.id === cardId) {
        return { ...c, starred: !c.starred }
      }
      return c
    })
    setCards(updated)
  }

  // Export to Markdown
  const handleExportMarkdown = () => {
    let md = `# My Knowledge Base 🌟\n`
    md += `Generated on: ${new Date().toLocaleDateString()}\n\n`
    md += `This is a collection of knowledge snippets grouped by subject.\n\n`
    md += `## Table of Contents 📂\n`
    
    // TOC
    subjects.forEach(sub => {
      const subCards = cards.filter(c => c.subjectId === sub.id)
      if (subCards.length > 0) {
        md += `- [${sub.emoji} ${sub.name}](#${sub.name.toLowerCase().replace(/\s+/g, '-')}) (${subCards.length} cards)\n`
      }
    })
    md += `\n---\n\n`

    // Subjects & Cards
    subjects.forEach(sub => {
      const subCards = cards.filter(c => c.subjectId === sub.id)
      if (subCards.length === 0) return

      md += `## ${sub.emoji} ${sub.name}\n\n`
      
      subCards.forEach((card, index) => {
        md += `### ${card.emoji} ${card.title}\n`
        md += `> **Key Takeaway:** ${card.summary}\n\n`
        md += `${card.content}\n\n`
        
        if (card.tags.length > 0) {
          md += `*Tags: ${card.tags.map(t => `\`#${t}\``).join(', ')}*\n\n`
        }
        
        md += `*Added on: ${card.dateAdded}*\n\n`
        
        if (index < subCards.length - 1) {
          md += `--- \n\n`
        }
      })
      md += `\n`
    })

    // Download file
    const element = document.createElement("a")
    const file = new Blob([md], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = "my-knowledge-cards.md"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Filter Cards
  const filteredCards = cards.filter(card => {
    // Subject filter
    if (selectedSubjectId === 'starred') {
      if (!card.starred) return false
    } else if (selectedSubjectId !== 'all' && card.subjectId !== selectedSubjectId) {
      return false
    }
    // Tag filter
    if (selectedTag && !card.tags.includes(selectedTag)) {
      return false
    }
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = card.title.toLowerCase().includes(query)
      const matchesSummary = card.summary.toLowerCase().includes(query)
      const matchesContent = card.content.toLowerCase().includes(query)
      const matchesTags = card.tags.some(tag => tag.toLowerCase().includes(query))
      return matchesTitle || matchesSummary || matchesContent || matchesTags
    }
    return true
  })

  // Get active subject metadata
  const activeSubject = selectedSubjectId === 'starred'
    ? { id: 'starred', name: 'Starred Cards', emoji: '⭐', color: 'lemon' as const }
    : subjects.find(s => s.id === selectedSubjectId)

  // Get all unique tags from cards matching the current selectedSubjectId
  const currentSubjectCards = selectedSubjectId === 'all' 
    ? cards 
    : selectedSubjectId === 'starred' 
      ? cards.filter(c => c.starred)
      : cards.filter(c => c.subjectId === selectedSubjectId)
  
  const allUniqueTags = Array.from(
    new Set(currentSubjectCards.flatMap(c => c.tags || []))
  ).sort()

  return (
    <div className="cute-app">
      {/* HEADER SECTION */}
      <header className="cute-header">
        <div className="logo-section">
          <div className="logo-icon-container">✨</div>
          <div>
            <h1>Subjective <Sparkles size={24} color="#ffd666" style={{ fill: '#ffd666' }} /></h1>
            <div className="logo-subtitle">Your colorful box of knowledge cards</div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="bouncy-button secondary"
            onClick={toggleTheme}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'light' ? "Dark Mode" : "Light Mode"}
          </button>
          
          <button
            className="bouncy-button accent"
            onClick={() => {
              exitStudyMode()
              setIsChatMode(!isChatMode)
            }}
            title={isChatMode ? "Switch to Cards Library" : "Switch to AI Chat Helper"}
            type="button"
          >
            {isChatMode ? "Library 📚" : "AI Helper 🤖"}
          </button>

          <button 
            className="bouncy-button secondary"
            onClick={handleExportMarkdown}
            title="Download all subjects and cards as a structured Markdown file"
          >
            <Download size={18} />
            Export to .MD
          </button>
          <button 
            className="bouncy-button primary"
            onClick={openAddCardModal}
          >
            <Plus size={18} />
            Add Card
          </button>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <div className="main-content" style={{ display: (isStudyMode || isChatMode) ? 'block' : 'grid' }}>
        {isStudyMode ? (
          <div className="study-mode-container">
            {currentStudyIndex >= studyCards.length ? (
              /* Success / Completion Screen */
              <div className="study-success-screen">
                <div className="success-emoji">🏆</div>
                <h2>Deck Completed!</h2>
                <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                  Great job! You reviewed all the cards in this deck. Repetition is the key to mastery! 🌱
                </p>
                <div className="study-actions-row">
                  <button className="bouncy-button primary" onClick={resetStudyDeck} type="button">
                    Review Again 🔁
                  </button>
                  <button className="bouncy-button accent" onClick={exitStudyMode} type="button">
                    Finish Study 🚪
                  </button>
                </div>
              </div>
            ) : (
              /* Active Studying Screen */
              <>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🃏 Studying: {selectedSubjectId === 'all' ? 'All Subjects' : activeSubject?.name}
                  </h2>
                  <button className="bouncy-button danger" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={exitStudyMode} type="button">
                    Exit Study
                  </button>
                </div>

                {/* Progress bar */}
                <div className="study-progress-wrapper">
                  <div 
                    className="study-progress-bar" 
                    style={{ width: `${(currentStudyIndex / studyCards.length) * 100}%` }}
                  />
                  <span className="study-progress-text">
                    Card {currentStudyIndex + 1} of {studyCards.length}
                  </span>
                </div>

                {/* 3D Flip Card */}
                {(() => {
                  const card = studyCards[currentStudyIndex];
                  const sub = subjects.find(s => s.id === card.subjectId);
                  const colorTheme = sub ? sub.color : 'lavender';
                  return (
                    <>
                      <div className="flip-card-container">
                        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                          <div className="flip-card-inner">
                            {/* Front Side */}
                            <div className={`flip-card-front card-${colorTheme}`}>
                              <div className="study-card-header">
                                <span className={`card-subject-badge badge-${colorTheme}`}>
                                  {sub ? sub.emoji : '📂'} {sub ? sub.name : 'Unknown'}
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f8c8d' }}>Tap to Flip</span>
                              </div>
                              <div className="study-card-emoji-large">{card.emoji}</div>
                              <div>
                                <h3 className="study-card-title">{card.title}</h3>
                                <p className="study-card-hint">Click card to reveal answer</p>
                              </div>
                            </div>

                            {/* Back Side */}
                            <div className={`flip-card-back card-${colorTheme}`}>
                              <div className="study-card-header">
                                <span className={`card-subject-badge badge-${colorTheme}`}>
                                  {sub ? sub.emoji : '📂'} {sub ? sub.name : 'Unknown'}
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f8c8d' }}>Answer</span>
                              </div>
                              <div className="study-back-notes">
                                <div style={{ fontSize: '1rem', fontStyle: 'italic', color: theme === 'dark' ? '#ff9ebb' : '#ec4899', fontWeight: 700, marginBottom: '0.75rem' }}>
                                  💡 "{card.summary}"
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                  {renderMarkdown(card.content)}
                                </div>
                              </div>
                              <p className="study-card-hint">Click card to flip back</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Navigation Action Row */}
                      <div className="study-actions-row">
                        <button 
                          className="bouncy-button secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudyAgain();
                          }}
                          title="Place this card at the end of the deck to repeat later"
                          type="button"
                        >
                          Study Again ⏳
                        </button>
                        <button 
                          className="bouncy-button mint" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudyGotIt();
                          }}
                          title="I got this! Mark as learned and proceed"
                          type="button"
                        >
                          Got it! 🌱
                        </button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        ) : isChatMode ? (
          /* AI Chat Helper Interface */
          <div className="ai-chat-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 180px)', background: 'white', border: '4px solid var(--dark-border)', borderRadius: '24px', boxShadow: '6px 6px 0 var(--dark-border)', padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #e1dbd6', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  🤖 AI Study Companion
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                  Ask questions about <strong>{selectedSubjectId === 'all' ? 'All Subjects' : activeSubject?.name}</strong>. AI responses will suggest flashcards you can save with a single click!
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`bouncy-button ${showDocAnalyzer ? 'primary' : 'secondary'}`} 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', boxShadow: '2px 2px 0 var(--dark-border)' }}
                  onClick={() => setShowDocAnalyzer(!showDocAnalyzer)}
                  type="button"
                >
                  {showDocAnalyzer ? "Chat Mode 💬" : "Document Import 📄"}
                </button>
                <button className="bouncy-button danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', boxShadow: '2px 2px 0 var(--dark-border)' }} onClick={clearChatHistory} type="button">
                  Clear Chat 🧹
                </button>
              </div>
            </div>

            {/* Document Analyzer Panel */}
            {showDocAnalyzer && (
              <div style={{
                background: theme === 'dark' ? '#1b1b22' : '#f9f6f0',
                border: '3px solid var(--dark-border)',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: '3px 3px 0 var(--dark-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme === 'dark' ? '#ffffff' : '#2c3e50' }}>
                    📚 Convert Document to Cards
                  </h3>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: theme === 'dark' ? '#ffffff' : '#2c3e50' }} 
                    onClick={() => setShowDocAnalyzer(false)}
                  >
                    ×
                  </button>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>
                  Drop or select a book (PDF), article (TXT, MD), presentation (PPTX), or code file. The AI will convert it and extract key knowledge cards.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                  {/* File Selection Box */}
                  <div 
                    onClick={async () => {
                      try {
                        const fileInfo = await window.electronAPI.selectDocumentFile()
                        if (fileInfo) {
                          setSelectedFile(fileInfo)
                        }
                      } catch (err: any) {
                        setChatError(`Failed to select file: ${err.message || err}`)
                      }
                    }}
                    style={{
                      border: '3px dashed var(--dark-border)',
                      borderRadius: '12px',
                      padding: '1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: theme === 'dark' ? '#121216' : 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.15s ease'
                    }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0]
                        const path = (file as any).path
                        if (path) {
                          setSelectedFile({
                            path: path,
                            name: file.name,
                            size: file.size
                          })
                        } else {
                          alert("Drag & Drop doesn't yield the absolute path in this browser context. Please click this box to browse and select the file natively instead!")
                        }
                      }
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>📁</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme === 'dark' ? '#ffffff' : '#2c3e50' }}>
                      {selectedFile ? selectedFile.name : "Drag & Drop or Click to Select"}
                    </span>
                    {selectedFile && (
                      <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>

                  {/* Extraction Settings */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: theme === 'dark' ? '#ffffff' : '#2c3e50' }}>Number of Cards to Generate:</label>
                      <input 
                        type="number" 
                        className="cute-input" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', borderRadius: '10px' }}
                        min={1} 
                        max={30} 
                        value={cardsCountToGenerate} 
                        onChange={(e) => setCardsCountToGenerate(Math.max(1, Math.min(30, parseInt(e.target.value) || 5)))}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: theme === 'dark' ? '#ffffff' : '#2c3e50' }}>Focus instruction (Optional):</label>
                      <input 
                        type="text" 
                        className="cute-input" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', borderRadius: '10px' }}
                        placeholder="e.g. key formulas, timelines..."
                        value={focusPrompt} 
                        onChange={(e) => setFocusPrompt(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  className="bouncy-button mint"
                  style={{ width: '100%', padding: '0.6rem', marginTop: '0.25rem', boxShadow: '3px 3px 0 var(--dark-border)', opacity: (selectedFile && !isParsing && !isChatLoading) ? 1 : 0.6 }}
                  disabled={!selectedFile || isParsing || isChatLoading}
                  onClick={handleDocumentAnalyze}
                >
                  {isParsing ? "Extracting Text & Reading Document... ⏳" : isChatLoading ? "Generating Cards... 🧠" : "Analyze & Generate Cards 🚀"}
                </button>
              </div>
            )}

            {/* Messages Listing */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: '16px', background: theme === 'dark' ? '#121216' : '#faf8f5', border: '3px solid var(--dark-border)' }}>
              {chatMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center', color: '#7f8c8d' }}>
                  <span style={{ fontSize: '3.5rem' }}>🤖</span>
                  <h3 style={{ margin: 0 }}>Start a study chat!</h3>
                  <p style={{ margin: 0, maxWidth: '400px', fontSize: '0.9rem' }}>
                    Type a prompt below to ask your helper to explain concepts, suggest ideas, or generate new cards in subject: <strong>{selectedSubjectId === 'all' ? 'All Subjects' : activeSubject?.name}</strong>.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const suggestedCard = !isUser ? extractSuggestedCard(msg.content) : null;
                  
                  // Render markdown content text cleanly by stripping the suggested JSON block for display, if present
                  let displayText = msg.content;
                  if (suggestedCard) {
                    displayText = msg.content.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
                  }

                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '1rem',
                        borderRadius: '20px',
                        border: '3px solid var(--dark-border)',
                        boxShadow: '3px 3px 0 var(--dark-border)',
                        background: isUser ? '#8cd6ff' : (theme === 'dark' ? '#25252f' : 'white'),
                        color: isUser ? '#2c3e50' : (theme === 'dark' ? '#e2e8f0' : '#2c3e50')
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', color: isUser ? '#4f5f6f' : '#7f8c8d' }}>
                          {isUser ? '👤 You' : '🤖 AI Study Buddy'}
                        </div>
                        <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                          {displayText || "Here is your suggested card:"}
                        </div>

                        {/* Suggested Subject Recommendation */}
                        {suggestedCard && suggestedCard.suggestedSubject ? (
                          <div style={{
                            marginTop: '1rem',
                            border: '3px dashed #86dcb8',
                            borderRadius: '16px',
                            background: theme === 'dark' ? '#11261d' : '#e8f7f0',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            color: theme === 'dark' ? '#e2e8f0' : '#2ebb7f'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2ebb7f' }}>
                                🪐 Suggested Subject Category
                              </span>
                              <span style={{ fontSize: '1.5rem' }}>{suggestedCard.suggestedSubject.emoji || '📚'}</span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: theme === 'dark' ? '#e2e8f0' : '#2c3e50' }}>{suggestedCard.suggestedSubject.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: theme === 'dark' ? '#a0aec0' : '#7f8c8d' }}>
                              The AI recommends creating and switching to this subject folder. {suggestedCard.title ? `It will also add the initial card "${suggestedCard.title}".` : ''}
                            </p>
                            
                            <button
                              className="bouncy-button mint"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'fit-content', borderRadius: '10px', boxShadow: '2px 2px 0 var(--dark-border)', marginTop: '0.25rem' }}
                              onClick={() => handleCreateAndOpenSubject(suggestedCard.suggestedSubject, suggestedCard.title ? suggestedCard : null)}
                              type="button"
                            >
                              Create & Open Subject 🪐
                            </button>
                          </div>
                        ) : suggestedCard && Array.isArray(suggestedCard) ? (
                          <div style={{
                            marginTop: '1rem',
                            border: '3px dashed #b19ffb',
                            borderRadius: '16px',
                            background: theme === 'dark' ? '#121216' : '#f1ecff',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            color: theme === 'dark' ? '#e2e8f0' : '#4b3e8c'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8062f8' }}>
                                💡 Suggested Cards Bundle ({suggestedCard.length} cards)
                              </span>
                              <span style={{ fontSize: '1.5rem' }}>📚</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.25rem 0' }}>
                              {suggestedCard.map((cardItem: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                  <span>{cardItem.emoji || '💡'}</span>
                                  <span>{cardItem.title}</span>
                                </div>
                              ))}
                            </div>

                            {/* Subject selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0', color: theme === 'dark' ? '#e2e8f0' : '#2c3e50' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Save to subject:</span>
                              <select 
                                className="cute-select" 
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', borderRadius: '8px', border: '2px solid var(--dark-border)', background: 'white', color: 'black' }}
                                value={chatImportSubjectId || (subjects[0]?.id || '')}
                                onChange={(e) => setChatImportSubjectId(e.target.value)}
                              >
                                {subjects.map(s => (
                                  <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <button
                              className="bouncy-button primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'fit-content', borderRadius: '10px', boxShadow: '2px 2px 0 var(--dark-border)', marginTop: '0.25rem' }}
                              onClick={() => handleSaveSuggestedCard(suggestedCard, chatImportSubjectId)}
                              type="button"
                            >
                              Add All to Deck ({suggestedCard.length}) 📥
                            </button>
                          </div>
                        ) : suggestedCard && (
                          <div style={{
                            marginTop: '1rem',
                            border: '3px dashed #b19ffb',
                            borderRadius: '16px',
                            background: theme === 'dark' ? '#121216' : '#f1ecff',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            color: theme === 'dark' ? '#e2e8f0' : '#4b3e8c'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8062f8' }}>
                                💡 Suggested Card Recommendation
                              </span>
                              <span style={{ fontSize: '1.5rem' }}>{suggestedCard.emoji || '💡'}</span>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', color: theme === 'dark' ? '#e2e8f0' : '#2c3e50' }}>{suggestedCard.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: theme === 'dark' ? '#a0aec0' : '#7f8c8d' }}>"{suggestedCard.summary}"</p>

                            {/* Subject selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0', color: theme === 'dark' ? '#e2e8f0' : '#2c3e50' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Save to subject:</span>
                              <select 
                                className="cute-select" 
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem', borderRadius: '8px', border: '2px solid var(--dark-border)', background: 'white', color: 'black' }}
                                value={chatImportSubjectId || (subjects[0]?.id || '')}
                                onChange={(e) => setChatImportSubjectId(e.target.value)}
                              >
                                {subjects.map(s => (
                                  <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <button
                              className="bouncy-button primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'fit-content', borderRadius: '10px', boxShadow: '2px 2px 0 var(--dark-border)', marginTop: '0.25rem' }}
                              onClick={() => handleSaveSuggestedCard(suggestedCard, chatImportSubjectId)}
                              type="button"
                            >
                              Add to Deck 📥
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isChatLoading && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', alignSelf: 'flex-start', background: theme === 'dark' ? '#25252f' : 'white', border: '3px solid var(--dark-border)', padding: '0.75rem 1.25rem', borderRadius: '20px', boxShadow: '3px 3px 0 var(--dark-border)' }}>
                  <div style={{ animation: 'spin 1s linear infinite', border: '2px solid #bdc3c7', borderTopColor: '#8062f8', borderRadius: '50%', width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>AI Assistant is writing...</span>
                </div>
              )}

              {chatError && (
                <div style={{ alignSelf: 'center', padding: '0.75rem 1.25rem', background: '#ffebeb', border: '3px solid #ff8b8b', borderRadius: '16px', color: '#821f39', fontSize: '0.85rem' }}>
                  ❌ Error: {chatError}
                </div>
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <input
                type="text"
                className="cute-input"
                style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '1rem', borderRadius: '16px' }}
                placeholder={`Ask anything about ${selectedSubjectId === 'all' ? 'all subjects' : activeSubject?.name}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button 
                type="submit" 
                className="bouncy-button mint"
                style={{ borderRadius: '16px', padding: '0.75rem 1.75rem', boxShadow: '3px 3px 0 var(--dark-border)' }}
                disabled={isChatLoading || !chatInput.trim()}
              >
                Send 🚀
              </button>
            </form>
          </div>
        ) : (
          /* Normal Dashboard Layout */
          <>
            <aside className="sidebar-panel">
              <div className="sidebar-title">
                <h2><BookMarked size={20} color="#ff9ebb" /> Subjects</h2>
                <button 
                  className="card-action-btn"
                  onClick={() => setIsSubjectModalOpen(true)}
                  title="Add New Subject"
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="subject-list">
                <button
                  onClick={() => setSelectedSubjectId('all')}
                  className={`subject-item ${selectedSubjectId === 'all' ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: selectedSubjectId === 'all' ? (theme === 'dark' ? '#25252f' : '#e2e8f0') : (theme === 'dark' ? '#1b1b22' : 'white'),
                    borderColor: 'var(--dark-border)',
                    color: selectedSubjectId === 'all' ? (theme === 'dark' ? '#ffffff' : '#2c3e50') : (theme === 'dark' ? '#a0aec0' : '#2c3e50')
                  }}
                  type="button"
                >
                  <div className="subject-left">
                    <span className="subject-emoji">🌈</span>
                    <span>All Subjects</span>
                  </div>
                  <span className="subject-count">{cards.length}</span>
                </button>

                <button
                  onClick={() => setSelectedSubjectId('starred')}
                  className={`subject-item subject-lemon ${selectedSubjectId === 'starred' ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: selectedSubjectId === 'starred' ? (theme === 'dark' ? '#25252f' : '#fffde6') : (theme === 'dark' ? '#1b1b22' : 'white'),
                    borderColor: 'var(--dark-border)',
                    color: selectedSubjectId === 'starred' ? (theme === 'dark' ? '#ffffff' : '#2c3e50') : (theme === 'dark' ? '#a0aec0' : '#2c3e50')
                  }}
                  type="button"
                >
                  <div className="subject-left">
                    <span className="subject-emoji">⭐</span>
                    <span>Starred Cards</span>
                  </div>
                  <span className="subject-count">{cards.filter(c => c.starred).length}</span>
                </button>

                {subjects.map(sub => {
                  const count = cards.filter(c => c.subjectId === sub.id).length
                  return (
                    <div key={sub.id} className="relative group">
                      <button
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`subject-item subject-${sub.color} ${selectedSubjectId === sub.id ? 'active' : ''}`}
                        type="button"
                      >
                        <div className="subject-left">
                          <span className="subject-emoji">{sub.emoji}</span>
                          <span>{sub.name}</span>
                        </div>
                        <span className="subject-count">{count}</span>
                      </button>
                      
                      <button 
                        className="absolute -right-2 -top-2 bg-rose-200 border-2 border-slate-700 text-rose-800 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSubject(sub.id, sub.name)
                        }}
                        title="Delete Subject"
                        type="button"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* TAGS CLOUD */}
              {allUniqueTags.length > 0 && (
                <div className="sidebar-tags-section" style={{ marginTop: '2rem', borderTop: '2px dashed #e1dbd6', paddingTop: '1.25rem' }}>
                  <div className="sidebar-title" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: 0, fontSize: '1.1rem' }}>
                      <Tag size={16} color="#8cd6ff" />
                      <span>Tag Filter</span>
                    </h2>
                    {selectedTag && (
                      <button 
                        className="bouncy-button secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', boxShadow: '2px 2px 0 var(--dark-border)', border: '2px solid var(--dark-border)', borderRadius: '8px' }}
                        onClick={() => setSelectedTag(null)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="tag-cloud-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto', padding: '2px' }}>
                    {allUniqueTags.map(tag => {
                      const isActive = selectedTag === tag
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(isActive ? null : tag)}
                          className={`cute-tag-pill ${isActive ? 'active' : ''}`}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.8rem',
                            borderRadius: '10px',
                            border: '2px solid var(--dark-border)',
                            background: isActive ? '#ffd666' : (theme === 'dark' ? '#25252f' : 'white'),
                            color: theme === 'dark' ? '#e2e8f0' : '#2c3e50',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                            boxShadow: isActive ? '1px 1px 0 var(--dark-border)' : '2px 2px 0 var(--dark-border)'
                          }}
                          type="button"
                        >
                          #{tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>

            <div className="dashboard-area">
              <div className="controls-bar">
                <div className="search-input-wrapper">
                  <Search className="search-icon-inside" size={20} />
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search card titles, summary, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black font-bold"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="stats-pill">
                  <BookOpen size={18} color="#8062f8" />
                  <span>
                    Showing {filteredCards.length} of {cards.length} cards
                  </span>
                </div>

                {filteredCards.length > 0 && (
                  <button
                    className="bouncy-button primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', boxShadow: '3px 3px 0 var(--dark-border)' }}
                    onClick={startStudyMode}
                    type="button"
                  >
                    Study Deck 🃏
                  </button>
                )}
              </div>

              {filteredCards.length > 0 ? (
                <div className="cards-grid">
                  {filteredCards.map(card => {
                    const sub = subjects.find(s => s.id === card.subjectId)
                    const colorTheme = sub ? sub.color : 'lavender'
                    return (
                      <article 
                        key={card.id} 
                        className={`knowledge-card card-${colorTheme}`}
                        onClick={() => setViewingCard(card)}
                      >
                        <div>
                          <div className="card-header">
                            <span className={`card-subject-badge badge-${colorTheme}`}>
                              {sub ? sub.emoji : '📂'} {sub ? sub.name : 'Unknown'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button 
                                className={`card-star-btn ${card.starred ? 'starred' : ''}`}
                                onClick={(e) => toggleStarCard(card.id, e)}
                                title={card.starred ? "Unstar Card" : "Star Card"}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: card.starred ? '#f59e0b' : '#a0aec0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '2px',
                                  transition: 'transform 0.15s ease'
                                }}
                                type="button"
                              >
                                <Star size={16} fill={card.starred ? '#f59e0b' : 'none'} style={{ strokeWidth: 2.5 }} />
                              </button>
                              <span className="card-emoji">{card.emoji}</span>
                            </div>
                          </div>
                          
                          <h3 className="card-title">{highlightText(card.title, searchQuery)}</h3>
                          <p className="card-summary">{highlightText(card.summary, searchQuery)}</p>
                        </div>

                        <div>
                          {card.tags.length > 0 && (
                            <div className="card-tags">
                              {card.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="card-tag">#{highlightText(tag, searchQuery)}</span>
                              ))}
                              {card.tags.length > 3 && (
                                <span className="card-tag">+{card.tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          <div className="card-footer">
                            <span className="card-date">{card.dateAdded}</span>
                            <div className="card-actions">
                              <button 
                                className="card-action-btn"
                                onClick={(e) => openEditCardModal(card, e)}
                                title="Edit Card"
                                type="button"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                className="card-action-btn delete"
                                onClick={(e) => handleDeleteCard(card.id, card.title, e)}
                                title="Delete Card"
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🎨</div>
                  <h3>No Cards Found</h3>
                  <p>
                    {searchQuery 
                      ? "We couldn't find any cards matching your search query. Try typing something else!"
                      : "This subject is currently empty. Click 'Add Card' above to record some knowledge!"}
                  </p>
                  {!searchQuery && (
                    <button 
                      className="bouncy-button primary"
                      onClick={openAddCardModal}
                      type="button"
                    >
                      Create First Card
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL - ADD/EDIT SUBJECT */}
      {isSubjectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSubjectModalOpen(false)}>
          <div className="cute-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎨 Create New Subject</h3>
              <button className="close-btn" onClick={() => setIsSubjectModalOpen(false)}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddSubject}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="subName">Subject Name</label>
                  <input 
                    type="text" 
                    id="subName"
                    className="cute-input" 
                    placeholder="e.g., Astrophysics, Gardening..."
                    value={newSubName}
                    onChange={e => setNewSubName(e.target.value)}
                    required
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label>Subject Icon/Emoji</label>
                  <div className="emoji-selector">
                    {subjectEmojis.map(emoji => (
                      <span
                        key={emoji}
                        className={`emoji-option ${newSubEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => setNewSubEmoji(emoji)}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Color Theme</label>
                  <div className="color-picker-grid">
                    {(['lavender', 'mint', 'peach', 'rose', 'sky', 'lemon'] as const).map(color => (
                      <button
                        type="button"
                        key={color}
                        className={`color-option color-option-${color} ${newSubColor === color ? 'selected' : ''}`}
                        onClick={() => setNewSubColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="bouncy-button secondary" 
                  onClick={() => setIsSubjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bouncy-button mint">
                  Create Subject!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - ADD/EDIT CARD */}
      {isCardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCardModalOpen(false)}>
          <div className="cute-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCard ? '✏️ Edit Knowledge Card' : '💡 Create Knowledge Card'}</h3>
              <button className="close-btn" onClick={() => setIsCardModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCardSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="cardSubject">Subject Category</label>
                  <select 
                    id="cardSubject"
                    className="cute-select"
                    value={cardSubjectId}
                    onChange={e => setCardSubjectId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Subject...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cardTitle">Card Title</label>
                  <input 
                    type="text" 
                    id="cardTitle"
                    className="cute-input" 
                    placeholder="e.g., Quantum Entanglement, Cognitive Load..."
                    value={cardTitle}
                    onChange={e => setCardTitle(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Card Emoji</label>
                  <div className="emoji-selector" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {cardEmojis.map(emoji => (
                      <span
                        key={emoji}
                        className={`emoji-option ${cardEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => setCardEmoji(emoji)}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardSummary">Key Takeaway / Summary</label>
                  <input 
                    type="text" 
                    id="cardSummary"
                    className="cute-input" 
                    placeholder="A quick one-sentence summary of this knowledge..."
                    value={cardSummary}
                    onChange={e => setCardSummary(e.target.value)}
                    maxLength={150}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardContent">Detailed Notes</label>
                  <textarea 
                    id="cardContent"
                    className="cute-textarea" 
                    placeholder="Write detailed explanations, examples, formulas, or bullet points..."
                    value={cardContent}
                    onChange={e => setCardContent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardTags">Tags (Comma-separated)</label>
                  <input 
                    type="text" 
                    id="cardTags"
                    className="cute-input" 
                    placeholder="e.g., physics, theory, mind"
                    value={cardTagsString}
                    onChange={e => setCardTagsString(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="bouncy-button secondary" 
                  onClick={() => setIsCardModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bouncy-button mint">
                  {editingCard ? 'Save Changes' : 'Add to Collection!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - VIEW CARD DETAILS */}
      {viewingCard && (
        <div className="modal-overlay" onClick={() => setViewingCard(null)}>
          <div className="cute-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <button className="close-btn" style={{ marginLeft: 'auto' }} onClick={() => setViewingCard(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ paddingTop: 0 }}>
              <div className="details-header">
                <span className="details-emoji">{viewingCard.emoji}</span>
                <div className="details-title-container">
                  <span className={`card-subject-badge badge-${
                    subjects.find(s => s.id === viewingCard.subjectId)?.color || 'lavender'
                  }`} style={{ width: 'fit-content' }}>
                    {subjects.find(s => s.id === viewingCard.subjectId)?.name || 'Knowledge'}
                  </span>
                  <h2>{viewingCard.title}</h2>
                </div>
              </div>

              {viewingCard.summary && (
                <div className="details-summary">
                  💡 "{viewingCard.summary}"
                </div>
              )}

              <div className="details-notes-title">
                <BookOpen size={16} /> <strong>Detailed Explanation:</strong>
              </div>
              <div className="details-content">
                {viewingCard.content ? renderMarkdown(viewingCard.content) : "No detailed notes added yet."}
              </div>

              {viewingCard.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Tag size={14} color="#7f8c8d" />
                  {viewingCard.tags.map(tag => (
                    <span key={tag} className="card-tag">#{tag}</span>
                  ))}
                </div>
              )}

              {/* AI Explainer Section */}
              <div style={{ marginTop: '1.5rem', borderTop: '2px dashed #e1dbd6', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="details-notes-title" style={{ margin: 0 }}>
                    <Sparkles size={16} color="#8062f8" /> <strong>AI Explainer (DeepSeek)</strong>
                  </div>
                  {!aiExplanation && !isAiLoading && (
                    <button 
                      className="bouncy-button primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '10px', boxShadow: '2px 2px 0 var(--dark-border)' }}
                      onClick={handleAiExplain}
                      type="button"
                    >
                      Explain Concept
                    </button>
                  )}
                </div>

                {isAiLoading && (
                  <div style={{ padding: '1rem', background: 'rgba(128,98,248,0.05)', border: '3px dashed #bdc3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ animation: 'spin 1s linear infinite', border: '3px solid #bdc3c7', borderTopColor: '#8062f8', borderRadius: '50%', width: '18px', height: '18px' }} />
                    <span>DeepSeek is thinking... analyzing details...</span>
                  </div>
                )}

                {aiError && (
                  <div style={{ padding: '1rem', background: '#ffebeb', border: '3px solid #ff8b8b', borderRadius: '16px', color: '#821f39', fontSize: '0.9rem' }}>
                    ❌ {aiError}
                  </div>
                )}

                {aiExplanation && (
                  <div style={{ 
                    lineHeight: '1.6', 
                    fontSize: '0.95rem', 
                    background: theme === 'dark' ? '#121216' : '#f1ecff', 
                    border: '3px solid var(--dark-border)', 
                    borderRadius: '16px', 
                    padding: '1.25rem', 
                    color: theme === 'dark' ? '#e2e8f0' : '#4b3e8c'
                  }}>
                    {renderMarkdown(aiExplanation)}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <span style={{ marginRight: 'auto', alignSelf: 'center', fontSize: '0.85rem', color: '#95a5a6' }}>
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 
                Added on {viewingCard.dateAdded}
              </span>
              <button 
                className="bouncy-button secondary" 
                onClick={(e) => {
                  setViewingCard(null)
                  openEditCardModal(viewingCard, e)
                }}
              >
                <Edit3 size={16} /> Edit
              </button>
              <button 
                className="bouncy-button accent" 
                onClick={() => setViewingCard(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
