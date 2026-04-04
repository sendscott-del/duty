export interface ChorePreset {
  name: string
  emoji: string
  frequency: 'daily' | 'weekly'
  points: number
  category: string
}

export const CHORE_PRESETS: ChorePreset[] = [
  // Kitchen
  { name: 'Unload dishwasher', emoji: '🍽️', frequency: 'daily', points: 3, category: 'Kitchen' },
  { name: 'Load dishwasher', emoji: '🫧', frequency: 'daily', points: 3, category: 'Kitchen' },
  { name: 'Wipe down counters', emoji: '🧽', frequency: 'daily', points: 2, category: 'Kitchen' },
  { name: 'Set the table', emoji: '🍴', frequency: 'daily', points: 1, category: 'Kitchen' },
  { name: 'Clear the table', emoji: '🗑️', frequency: 'daily', points: 1, category: 'Kitchen' },
  { name: 'Take out trash', emoji: '🚮', frequency: 'daily', points: 2, category: 'Kitchen' },
  { name: 'Take out recycling', emoji: '♻️', frequency: 'weekly', points: 2, category: 'Kitchen' },
  { name: 'Sweep kitchen floor', emoji: '🧹', frequency: 'daily', points: 2, category: 'Kitchen' },
  { name: 'Mop kitchen floor', emoji: '🫧', frequency: 'weekly', points: 4, category: 'Kitchen' },
  { name: 'Clean microwave', emoji: '📦', frequency: 'weekly', points: 3, category: 'Kitchen' },

  // Bathroom
  { name: 'Clean toilet', emoji: '🚽', frequency: 'weekly', points: 4, category: 'Bathroom' },
  { name: 'Wipe bathroom counter', emoji: '🪥', frequency: 'daily', points: 2, category: 'Bathroom' },
  { name: 'Clean bathroom mirror', emoji: '🪞', frequency: 'weekly', points: 2, category: 'Bathroom' },
  { name: 'Scrub bathtub/shower', emoji: '🛁', frequency: 'weekly', points: 5, category: 'Bathroom' },
  { name: 'Replace toilet paper', emoji: '🧻', frequency: 'daily', points: 1, category: 'Bathroom' },
  { name: 'Take out bathroom trash', emoji: '🗑️', frequency: 'weekly', points: 1, category: 'Bathroom' },

  // Bedroom
  { name: 'Make bed', emoji: '🛏️', frequency: 'daily', points: 1, category: 'Bedroom' },
  { name: 'Pick up room', emoji: '👕', frequency: 'daily', points: 2, category: 'Bedroom' },
  { name: 'Vacuum bedroom', emoji: '🧹', frequency: 'weekly', points: 3, category: 'Bedroom' },
  { name: 'Dust bedroom', emoji: '✨', frequency: 'weekly', points: 2, category: 'Bedroom' },
  { name: 'Organize closet', emoji: '👔', frequency: 'weekly', points: 4, category: 'Bedroom' },
  { name: 'Change bed sheets', emoji: '🛏️', frequency: 'weekly', points: 4, category: 'Bedroom' },

  // Laundry
  { name: 'Sort dirty laundry', emoji: '🧺', frequency: 'daily', points: 1, category: 'Laundry' },
  { name: 'Start a load of laundry', emoji: '👚', frequency: 'weekly', points: 2, category: 'Laundry' },
  { name: 'Move laundry to dryer', emoji: '🌀', frequency: 'weekly', points: 1, category: 'Laundry' },
  { name: 'Fold laundry', emoji: '👕', frequency: 'weekly', points: 3, category: 'Laundry' },
  { name: 'Put away laundry', emoji: '🗄️', frequency: 'weekly', points: 2, category: 'Laundry' },

  // Living Areas
  { name: 'Vacuum living room', emoji: '🧹', frequency: 'weekly', points: 3, category: 'Living Areas' },
  { name: 'Dust furniture', emoji: '✨', frequency: 'weekly', points: 3, category: 'Living Areas' },
  { name: 'Tidy living room', emoji: '🛋️', frequency: 'daily', points: 2, category: 'Living Areas' },
  { name: 'Fluff couch pillows', emoji: '🛋️', frequency: 'daily', points: 1, category: 'Living Areas' },
  { name: 'Wipe down light switches', emoji: '💡', frequency: 'weekly', points: 1, category: 'Living Areas' },

  // Outside
  { name: 'Mow the lawn', emoji: '🌿', frequency: 'weekly', points: 8, category: 'Outside' },
  { name: 'Water plants', emoji: '🌱', frequency: 'daily', points: 2, category: 'Outside' },
  { name: 'Pull weeds', emoji: '🌾', frequency: 'weekly', points: 5, category: 'Outside' },
  { name: 'Sweep porch/driveway', emoji: '🧹', frequency: 'weekly', points: 3, category: 'Outside' },
  { name: 'Bring in mail', emoji: '📬', frequency: 'daily', points: 1, category: 'Outside' },
  { name: 'Take out garbage cans', emoji: '🗑️', frequency: 'weekly', points: 3, category: 'Outside' },
  { name: 'Bring in garbage cans', emoji: '🗑️', frequency: 'weekly', points: 2, category: 'Outside' },
  { name: 'Scoop dog poop', emoji: '💩', frequency: 'daily', points: 3, category: 'Outside' },

  // Pets
  { name: 'Feed pets', emoji: '🐾', frequency: 'daily', points: 2, category: 'Pets' },
  { name: 'Fill water bowl', emoji: '💧', frequency: 'daily', points: 1, category: 'Pets' },
  { name: 'Walk the dog', emoji: '🐕', frequency: 'daily', points: 4, category: 'Pets' },
  { name: 'Clean litter box', emoji: '🐱', frequency: 'daily', points: 3, category: 'Pets' },
  { name: 'Brush pet', emoji: '🐶', frequency: 'weekly', points: 2, category: 'Pets' },

  // Personal
  { name: 'Brush teeth (morning)', emoji: '🪥', frequency: 'daily', points: 1, category: 'Personal' },
  { name: 'Brush teeth (night)', emoji: '🪥', frequency: 'daily', points: 1, category: 'Personal' },
  { name: 'Practice instrument', emoji: '🎵', frequency: 'daily', points: 3, category: 'Personal' },
  { name: 'Read for 20 minutes', emoji: '📖', frequency: 'daily', points: 2, category: 'Personal' },
  { name: 'Do homework', emoji: '📝', frequency: 'daily', points: 3, category: 'Personal' },
  { name: 'Pack school bag', emoji: '🎒', frequency: 'daily', points: 1, category: 'Personal' },
]

export interface RewardPreset {
  name: string
  emoji: string
  points: number
  category: string
}

export const REWARD_PRESETS: RewardPreset[] = [
  // Screen Time
  { name: '30 min extra screen time', emoji: '📱', points: 5, category: 'Screen Time' },
  { name: '1 hour gaming', emoji: '🎮', points: 10, category: 'Screen Time' },
  { name: 'Movie night pick', emoji: '🎬', points: 15, category: 'Screen Time' },
  { name: 'YouTube time (30 min)', emoji: '📺', points: 5, category: 'Screen Time' },
  { name: 'Stay up 30 min late', emoji: '🌙', points: 10, category: 'Screen Time' },

  // Food & Treats
  { name: 'Ice cream trip', emoji: '🍦', points: 20, category: 'Food & Treats' },
  { name: 'Pick dinner for the family', emoji: '🍕', points: 25, category: 'Food & Treats' },
  { name: 'Candy bar', emoji: '🍫', points: 5, category: 'Food & Treats' },
  { name: 'Bake cookies together', emoji: '🍪', points: 15, category: 'Food & Treats' },
  { name: 'Smoothie run', emoji: '🥤', points: 10, category: 'Food & Treats' },
  { name: 'Breakfast in bed', emoji: '🧇', points: 20, category: 'Food & Treats' },
  { name: 'Get a donut', emoji: '🍩', points: 8, category: 'Food & Treats' },

  // Activities
  { name: 'Trip to the park', emoji: '🛝', points: 15, category: 'Activities' },
  { name: 'Friend sleepover', emoji: '🏠', points: 40, category: 'Activities' },
  { name: 'Go bowling', emoji: '🎳', points: 30, category: 'Activities' },
  { name: 'Swimming', emoji: '🏊', points: 20, category: 'Activities' },
  { name: 'Bike ride with parent', emoji: '🚴', points: 15, category: 'Activities' },
  { name: 'Arts & crafts time', emoji: '🎨', points: 10, category: 'Activities' },
  { name: 'Board game night', emoji: '🎲', points: 10, category: 'Activities' },
  { name: 'Go to the movies', emoji: '🎥', points: 35, category: 'Activities' },
  { name: 'Mini golf', emoji: '⛳', points: 30, category: 'Activities' },

  // Privileges
  { name: 'Skip one chore', emoji: '⏭️', points: 15, category: 'Privileges' },
  { name: 'No chores day', emoji: '🎉', points: 50, category: 'Privileges' },
  { name: 'Extra allowance ($1)', emoji: '💵', points: 10, category: 'Privileges' },
  { name: 'Extra allowance ($5)', emoji: '💰', points: 50, category: 'Privileges' },
  { name: 'Pick the music in the car', emoji: '🎵', points: 5, category: 'Privileges' },
  { name: 'Ride shotgun', emoji: '🚗', points: 8, category: 'Privileges' },

  // Big Rewards
  { name: 'New toy/game (up to $20)', emoji: '🧸', points: 100, category: 'Big Rewards' },
  { name: 'New book', emoji: '📚', points: 30, category: 'Big Rewards' },
  { name: 'Amusement park trip', emoji: '🎢', points: 200, category: 'Big Rewards' },
  { name: 'New clothes shopping', emoji: '👟', points: 80, category: 'Big Rewards' },
  { name: '$10 Roblox/Robux', emoji: '🎮', points: 75, category: 'Big Rewards' },
  { name: '$25 Amazon gift card', emoji: '🛒', points: 150, category: 'Big Rewards' },
]
