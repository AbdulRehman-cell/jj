const mongoose = require('mongoose');

// Define schemas locally to prevent relative path resolve errors in different environments
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Quiz topic is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Quiz difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    imageUrl: {
      type: String,
      required: [true, 'Quiz cover image URL is required'],
      default: 'https://picsum.photos/seed/quiz/800/600',
    }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference (quizId) is required'],
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: String,
      required: [true, 'Options are required. Please provide them as a JSON string array.'],
      trim: true,
      default: '[]'
    },
    correctOption: {
      type: String,
      required: [true, 'Correct option text is required'],
      trim: true
    }
  },
  { timestamps: true }
);

const leaderboardSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters long']
    },
    quizTitle: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative']
    },
    timeSpent: {
      type: Number,
      required: [true, 'Time spent is required'],
      min: [0, 'Time spent cannot be negative']
    }
  },
  { timestamps: true }
);

// Fallback checks to prevent overwrite errors if already registered in mongoose
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brainsnap';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB database at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connection secure.');

    // 1. Seed Quizzes if empty
    const quizCount = await Quiz.countDocuments();
    let quizzes = [];
    if (quizCount === 0) {
      console.log('Seeding baseline Quizzes...');
      quizzes = await Quiz.insertMany([
        {
          title: 'Quantum & Cosmos',
          topic: 'Science',
          difficulty: 'Hard',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Chronicles of Rome',
          topic: 'History',
          difficulty: 'Medium',
          imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Pop Culture & Retro Gaming',
          topic: 'Pop Culture',
          difficulty: 'Easy',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
        }
      ]);
      console.log(`Successfully seeded ${quizzes.length} Quizzes.`);
    } else {
      console.log('Quizzes already exist in database.');
      quizzes = await Quiz.find();
    }

    // 2. Seed Questions if empty
    const questionCount = await Question.countDocuments();
    if (questionCount === 0 && quizzes.length > 0) {
      console.log('Seeding targeted Questions...');
      const questionsData = [];

      // Find the specific quiz IDs
      const quantumQuiz = quizzes.find(q => q.title.includes('Quantum'));
      const romeQuiz = quizzes.find(q => q.title.includes('Rome'));
      const popQuiz = quizzes.find(q => q.title.includes('Pop'));

      if (quantumQuiz) {
        questionsData.push(
          {
            quizId: quantumQuiz._id,
            questionText: 'Which elementary particle acts as the gauge boson for the electromagnetic interaction?',
            options: JSON.stringify(['Gluon', 'Photon', 'W Boson', 'Higgs Boson']),
            correctOption: 'Photon'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'What represents the maximum theoretical speed limit of information transmission across space?',
            options: JSON.stringify(['Sound velocity', 'Speed of light in vacuum', 'Quantum entanglement speed', 'Earth orbital speed']),
            correctOption: 'Speed of light in vacuum'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'Which principle states that you cannot simultaneously measure both position and momentum of a particle with absolute precision?',
            options: JSON.stringify(['Heisenberg Uncertainty Principle', 'Pauli Exclusion Principle', 'Schrödinger Equation', 'Planck Postulate']),
            correctOption: 'Heisenberg Uncertainty Principle'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'What is the hypothetical boundary surrounding a black hole beyond which nothing can escape?',
            options: JSON.stringify(['Singularity', 'Ergosphere', 'Event Horizon', 'Roche Limit']),
            correctOption: 'Event Horizon'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'Which planet is known to possess the most extensive and visually prominent ring system in our solar system?',
            options: JSON.stringify(['Jupiter', 'Uranus', 'Neptune', 'Saturn']),
            correctOption: 'Saturn'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'What type of force holds the atomic nucleus together despite electromagnetic repulsion between protons?',
            options: JSON.stringify(['Strong Nuclear Force', 'Weak Nuclear Force', 'Gravitational Force', 'Centrifugal Force']),
            correctOption: 'Strong Nuclear Force'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'Which galaxy is currently on a direct collision course with our Milky Way galaxy?',
            options: JSON.stringify(['Triangulum Galaxy', 'Andromeda Galaxy', 'Large Magellanic Cloud', 'Sombrero Galaxy']),
            correctOption: 'Andromeda Galaxy'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'What unit is used to measure cosmological distances, equivalent to approximately 3.26 light-years?',
            options: JSON.stringify(['Astronomical Unit', 'Parsec', 'Megameter', 'Planck Length']),
            correctOption: 'Parsec'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'What elementary particle is the fundamental component of protons and neutrons?',
            options: JSON.stringify(['Lepton', 'Quark', 'Neutrino', 'Muon']),
            correctOption: 'Quark'
          },
          {
            quizId: quantumQuiz._id,
            questionText: 'Which scientist formulated the theory of general relativity published in 1915?',
            options: JSON.stringify(['Isaac Newton', 'Niels Bohr', 'Albert Einstein', 'Stephen Hawking']),
            correctOption: 'Albert Einstein'
          }
        );
      }

      if (romeQuiz) {
        questionsData.push(
          {
            quizId: romeQuiz._id,
            questionText: 'Who was the first official Emperor of the Roman Empire, ruling from 27 BC until his death?',
            options: JSON.stringify(['Julius Caesar', 'Nero', 'Augustus', 'Marcus Aurelius']),
            correctOption: 'Augustus'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'In which year did the Western Roman Empire traditionally fall?',
            options: JSON.stringify(['330 AD', '476 AD', '1453 AD', '753 BC']),
            correctOption: '476 AD'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Which volcano erupted in 79 AD, destroying the thriving Roman city of Pompeii?',
            options: JSON.stringify(['Mount Etna', 'Mount Stromboli', 'Mount Vesuvius', 'Mount Olympus']),
            correctOption: 'Mount Vesuvius'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'What was the code of laws written on bronze tablets that stood at the foundation of Roman law?',
            options: JSON.stringify(['Justinian Code', 'The Twelve Tables', 'The Edict of Milan', 'Pax Romana']),
            correctOption: 'The Twelve Tables'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Who led the famous slave rebellion against the Roman Republic starting in 73 BC?',
            options: JSON.stringify(['Spartacus', 'Hannibal', 'Cincinnatus', 'Vercingetorix']),
            correctOption: 'Spartacus'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Which Carthaginian general crossed the Alps with war elephants to attack Rome during the Second Punic War?',
            options: JSON.stringify(['Hamilcar Barca', 'Scipio Africanus', 'Hannibal', 'Cleopatra']),
            correctOption: 'Hannibal'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'The Colosseum in Rome is also historically known as which of the following structures?',
            options: JSON.stringify(['Circus Maximus', 'The Pantheon', 'The Flavian Amphitheatre', 'Curia Julia']),
            correctOption: 'The Flavian Amphitheatre'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Which Roman Emperor famously legalized Christianity in the empire through the Edict of Milan?',
            options: JSON.stringify(['Constantine the Great', 'Diocletian', 'Caligula', 'Trajan']),
            correctOption: 'Constantine the Great'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Which defensive fortification did the Romans build across the width of northern Britain?',
            options: JSON.stringify(['Antonine Wall', 'Hadrian’s Wall', 'Trajan’s Wall', 'The Saxon Shore']),
            correctOption: 'Hadrian’s Wall'
          },
          {
            quizId: romeQuiz._id,
            questionText: 'Who was the primary Roman god of war and agriculture, legendary father of Romulus and Remus?',
            options: JSON.stringify(['Jupiter', 'Neptune', 'Mars', 'Pluto']),
            correctOption: 'Mars'
          }
        );
      }

      if (popQuiz) {
        questionsData.push(
          {
            quizId: popQuiz._id,
            questionText: 'Which classic arcade video game, released in 1980, features a yellow circular character eating dots in a maze?',
            options: JSON.stringify(['Space Invaders', 'Pac-Man', 'Donkey Kong', 'Asteroids']),
            correctOption: 'Pac-Man'
          },
          {
            quizId: popQuiz._id,
            questionText: 'What is the name of the fictional continent where the main events of Game of Thrones take place?',
            options: JSON.stringify(['Middle-earth', 'Tamriel', 'Westeros', 'Azeroth']),
            correctOption: 'Westeros'
          },
          {
            quizId: popQuiz._id,
            questionText: 'Which actor famously played Neo in the hit sci-fi action franchise "The Matrix"?',
            options: JSON.stringify(['Keanu Reeves', 'Laurence Fishburne', 'Brad Pitt', 'Hugo Weaving']),
            correctOption: 'Keanu Reeves'
          },
          {
            quizId: popQuiz._id,
            questionText: 'What is the best-selling video game console of all time, reaching over 155 million units sold?',
            options: JSON.stringify(['Nintendo Entertainment System', 'Sony PlayStation 2', 'Nintendo Wii', 'Xbox 360']),
            correctOption: 'Sony PlayStation 2'
          },
          {
            quizId: popQuiz._id,
            questionText: 'Which legendary band released the hit album "The Dark Side of the Moon" in 1973?',
            options: JSON.stringify(['The Beatles', 'Led Zeppelin', 'Pink Floyd', 'Queen']),
            correctOption: 'Pink Floyd'
          },
          {
            quizId: popQuiz._id,
            questionText: 'In the game "Minecraft", what is the primary block required to create an active Nether Portal?',
            options: JSON.stringify(['Bedrock', 'Obsidian', 'Netherite', 'Glowstone']),
            correctOption: 'Obsidian'
          },
          {
            quizId: popQuiz._id,
            questionText: 'What is the name of the fictional kingdom ruled by Simba in Disney’s "The Lion King"?',
            options: JSON.stringify(['Pride Lands', 'Far Far Away', 'Arendelle', 'Wakanda']),
            correctOption: 'Pride Lands'
          },
          {
            quizId: popQuiz._id,
            questionText: 'Which popular social media platform launched in 2010 focused strictly on square image and video sharing?',
            options: JSON.stringify(['Twitter', 'Instagram', 'Snapchat', 'Tumblr']),
            correctOption: 'Instagram'
          },
          {
            quizId: popQuiz._id,
            questionText: 'Who is the iconic, mustachioed villain in the main Mario Bros. video game franchise?',
            options: JSON.stringify(['Wario', 'Bowser', 'Walugi', 'Donkey Kong']),
            correctOption: 'Bowser'
          },
          {
            quizId: popQuiz._id,
            questionText: 'What color is the standard Master Ball in the Pokémon video game series?',
            options: JSON.stringify(['Blue and Red', 'Purple and White', 'Green and Yellow', 'Black and Gold']),
            correctOption: 'Purple and White'
          }
        );
      }

      await Question.insertMany(questionsData);
      console.log(`Successfully seeded ${questionsData.length} target questions.`);
    } else {
      console.log('Questions already exist or no parent quizzes available to map.');
    }

    // 3. Seed Leaderboards if empty
    const leaderboardCount = await Leaderboard.countDocuments();
    if (leaderboardCount === 0) {
      console.log('Seeding Leaderboards...');
      await Leaderboard.insertMany([
        {
          username: 'NeuralKnight',
          quizTitle: 'Quantum & Cosmos',
          score: 9820,
          timeSpent: 28
        },
        {
          username: 'SynapseSlayer',
          quizTitle: 'Quantum & Cosmos',
          score: 8750,
          timeSpent: 34
        },
        {
          username: 'CerebralPro',
          quizTitle: 'Chronicles of Rome',
          score: 9100,
          timeSpent: 30
        },
        {
          username: 'ArcadeOverlord',
          quizTitle: 'Pop Culture & Retro Gaming',
          score: 10000,
          timeSpent: 22
        },
        {
          username: 'SpeedRunner99',
          quizTitle: 'Pop Culture & Retro Gaming',
          score: 9550,
          timeSpent: 25
        }
      ]);
      console.log('Leaderboard entries successfully seeded.');
    } else {
      console.log('Leaderboard records already populated.');
    }

    console.log('Database seeding protocols complete.');
  } catch (error) {
    console.error('Fatal error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection released.');
  }
}

seedDatabase();