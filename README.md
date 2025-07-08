# GT86Aero.com - GT86 Aero Owners Club

The definitive registry for Toyota GT86 Aero owners worldwide. A premium community platform celebrating one of the rarest GT86 variants ever made.

## Features

- **Owner Registration**: Register your GT86 Aero with detailed specifications
- **Visual Directory**: Browse registered Aeros with Instagram integration
- **Community Platform**: Connect with fellow GT86 Aero enthusiasts
- **Instagram Integration**: Link your Instagram posts to showcase your build
- **Global Registry**: Open to UK and international owners
- **Responsive Design**: Beautiful experience across all devices

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Animation**: Framer Motion
- **Icons**: React Icons (Feather)
- **Routing**: React Router DOM

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key
   - Create the `owners` table with the following schema:

   ```sql
   CREATE TABLE owners (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     display_name TEXT NOT NULL,
     instagram_handle TEXT,
     instagram_post_urls TEXT[],
     country TEXT NOT NULL,
     uk_region TEXT,
     year INTEGER NOT NULL,
     transmission TEXT NOT NULL,
     colour TEXT NOT NULL,
     mod_list TEXT,
     photo_urls TEXT[],
     public_profile BOOLEAN DEFAULT true,
     show_on_map BOOLEAN DEFAULT true,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

   - Create a storage bucket named `owner_photos` for image uploads
   - Enable Row Level Security (RLS) policies as needed

4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The `owners` table includes:
- Basic info (display name, Instagram handle)
- Vehicle details (year, color, transmission)
- Location data (country, UK region)
- Visual content (Instagram URLs, uploaded photos)
- Modification list
- Privacy settings
- User authentication link

## Community Features

- **#GT86AeroClub**: Official Instagram hashtag
- **Visual Registry**: Instagram-first approach with fallback uploads
- **Global Community**: UK-focused but internationally inclusive
- **Rare Car Celebration**: Fewer than 200 UK Aeros ever made

## Future Enhancements

- Interactive map view of registered owners
- For-sale listings marketplace
- Instagram feed integration
- Advanced search and filtering
- Community events and meets

## Contributing

This is a community project for GT86 Aero owners. Contributions welcome!

## License

MIT License - Built with ❤️ for the GT86 Aero community