import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')

  // Seed Countries
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
    'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
    'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Japan', 'South Korea',
    'China', 'India', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
    'New Zealand', 'Singapore', 'Malaysia', 'Thailand', 'Philippines',
    'Indonesia', 'Vietnam', 'South Africa', 'Egypt', 'Nigeria', 'Kenya',
    'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Turkey', 'Russia',
    'Ukraine', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Slovenia',
    'Slovakia', 'Hungary', 'Lithuania', 'Latvia', 'Estonia'
  ]

  console.log('Seeding countries...')
  for (const countryName of countries) {
    await prisma.country.upsert({
      where: { name: countryName },
      update: {},
      create: { name: countryName },
    })
  }
  console.log(`✓ Created ${countries.length} countries`)

  // Seed Categories and Subcategories
  const categoriesData = [
    {
      name: 'Movies',
      subcategories: [
        { name: 'Action Movies', popular: true },
        { name: 'Comedy Movies', popular: true },
        { name: 'Drama Movies', popular: true },
        { name: 'Horror Movies', popular: true },
        { name: 'Sci-Fi Movies', popular: true },
        { name: 'Romance Movies', popular: false },
        { name: 'Thriller Movies', popular: false },
        { name: 'Animation Movies', popular: false },
        { name: 'Documentary Movies', popular: false },
        { name: 'Fantasy Movies', popular: false },
      ]
    },
    {
      name: 'TV Shows',
      subcategories: [
        { name: 'Drama Series', popular: true },
        { name: 'Comedy Series', popular: true },
        { name: 'Crime Series', popular: true },
        { name: 'Sci-Fi Series', popular: false },
        { name: 'Reality TV', popular: false },
        { name: 'Anime', popular: true },
        { name: 'Documentaries', popular: false },
        { name: 'Talk Shows', popular: false },
      ]
    },
    {
      name: 'Music',
      subcategories: [
        { name: 'Rock Bands', popular: true },
        { name: 'Pop Artists', popular: true },
        { name: 'Hip Hop Artists', popular: true },
        { name: 'Jazz Artists', popular: false },
        { name: 'Classical Composers', popular: false },
        { name: 'Country Artists', popular: false },
        { name: 'Electronic Artists', popular: false },
        { name: 'R&B Artists', popular: false },
        { name: 'Metal Bands', popular: false },
        { name: 'Indie Artists', popular: false },
      ]
    },
    {
      name: 'Books',
      subcategories: [
        { name: 'Fiction Books', popular: true },
        { name: 'Non-Fiction Books', popular: true },
        { name: 'Mystery Books', popular: true },
        { name: 'Science Fiction Books', popular: false },
        { name: 'Fantasy Books', popular: true },
        { name: 'Biography Books', popular: false },
        { name: 'Self-Help Books', popular: false },
        { name: 'Historical Books', popular: false },
        { name: 'Romance Books', popular: false },
        { name: 'Poetry Books', popular: false },
      ]
    },
    {
      name: 'Food & Drink',
      subcategories: [
        { name: 'Restaurants', popular: true },
        { name: 'Fast Food Chains', popular: true },
        { name: 'Pizza Places', popular: true },
        { name: 'Coffee Shops', popular: true },
        { name: 'Desserts', popular: false },
        { name: 'Cocktails', popular: false },
        { name: 'Breakfast Foods', popular: false },
        { name: 'Cuisines', popular: false },
        { name: 'Snacks', popular: false },
      ]
    },
    {
      name: 'Travel',
      subcategories: [
        { name: 'Cities to Visit', popular: true },
        { name: 'Beach Destinations', popular: true },
        { name: 'Mountain Destinations', popular: false },
        { name: 'Historical Sites', popular: false },
        { name: 'National Parks', popular: false },
        { name: 'European Cities', popular: true },
        { name: 'Asian Cities', popular: false },
        { name: 'American Cities', popular: false },
      ]
    },
    {
      name: 'Video Games',
      subcategories: [
        { name: 'Action Games', popular: true },
        { name: 'RPG Games', popular: true },
        { name: 'Strategy Games', popular: false },
        { name: 'Sports Games', popular: true },
        { name: 'Racing Games', popular: false },
        { name: 'Puzzle Games', popular: false },
        { name: 'Horror Games', popular: false },
        { name: 'Adventure Games', popular: false },
        { name: 'Simulation Games', popular: false },
      ]
    },
    {
      name: 'Sports',
      subcategories: [
        { name: 'Soccer Teams', popular: true },
        { name: 'Basketball Teams', popular: true },
        { name: 'Football Teams', popular: true },
        { name: 'Baseball Teams', popular: false },
        { name: 'Hockey Teams', popular: false },
        { name: 'Athletes', popular: true },
        { name: 'Olympic Sports', popular: false },
        { name: 'Extreme Sports', popular: false },
      ]
    },
    {
      name: 'Technology',
      subcategories: [
        { name: 'Smartphones', popular: true },
        { name: 'Laptops', popular: true },
        { name: 'Programming Languages', popular: false },
        { name: 'Social Media Platforms', popular: true },
        { name: 'Operating Systems', popular: false },
        { name: 'Web Browsers', popular: false },
        { name: 'Apps', popular: true },
        { name: 'Gaming Consoles', popular: false },
      ]
    },
    {
      name: 'Art & Culture',
      subcategories: [
        { name: 'Painters', popular: false },
        { name: 'Sculptures', popular: false },
        { name: 'Museums', popular: true },
        { name: 'Art Movements', popular: false },
        { name: 'Photographers', popular: false },
        { name: 'Architects', popular: false },
      ]
    },
    {
      name: 'Fashion',
      subcategories: [
        { name: 'Clothing Brands', popular: true },
        { name: 'Shoe Brands', popular: true },
        { name: 'Fashion Designers', popular: false },
        { name: 'Accessories', popular: false },
        { name: 'Street Style', popular: false },
      ]
    },
    {
      name: 'Hobbies',
      subcategories: [
        { name: 'Board Games', popular: true },
        { name: 'Card Games', popular: false },
        { name: 'Crafts', popular: false },
        { name: 'Outdoor Activities', popular: true },
        { name: 'Indoor Activities', popular: false },
        { name: 'Collections', popular: false },
      ]
    },
  ]

  console.log('Seeding categories and subcategories...')
  for (const categoryData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { categoryName: categoryData.name },
      update: {},
      create: { categoryName: categoryData.name },
    })

    for (const subcat of categoryData.subcategories) {
      await prisma.subcategory.upsert({
        where: {
          subcategoryName: subcat.name,
        },
        update: {
          popular: subcat.popular,
        },
        create: {
          subcategoryName: subcat.name,
          categoryId: category.id,
          popular: subcat.popular,
        },
      })
    }

    console.log(`✓ Created category: ${categoryData.name} with ${categoryData.subcategories.length} subcategories`)
  }

  console.log('✓ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
