-- Seed data for sim-feed database
-- Run this after init.sql to populate tables with test data

-- Clear existing data (in reverse order of dependencies)
TRUNCATE
  chat_members,
  chats,
  admin_invitations,
  admin,
  user_follows,
  follows,
  likes,
  comments,
  posts,
  users,
  personas
RESTART IDENTITY CASCADE;

-- =====================
-- PERSONAS
-- =====================
INSERT INTO personas (bio, description, username) VALUES
('Tech enthusiast and coffee addict ☕', 'Software developer by day, gamer by night. Always learning something new.', 'techie_sam'),
('Living life one adventure at a time 🌍', 'Travel blogger sharing stories from around the world. 50+ countries visited!', 'wanderlust_emma'),
('Fitness | Nutrition | Mindset 💪', 'Certified personal trainer helping you become the best version of yourself.', 'fit_marcus'),
('Art is my therapy 🎨', 'Digital artist and illustrator. Commissions open. DM for collabs.', 'artsy_luna'),
('Cooking up a storm 🍳', 'Home chef sharing easy recipes for busy people. Food is love!', 'chef_carlos'),
('Books, tea, and cozy vibes 📚', 'Bookworm with opinions. Currently reading way too many books at once.', 'reader_maya'),
('Music producer | Beatmaker 🎵', 'Creating vibes since 2015. Links to my tracks in bio.', 'beats_by_jay'),
('Plant mom 🌱', 'Turning my apartment into a jungle, one plant at a time.', 'green_thumb_nina'),
('Dad jokes and bad puns 😂', 'Professional joke teller. Warning: humor may cause eye rolling.', 'punny_pete'),
('Minimalist lifestyle advocate ✨', 'Less stuff, more life. Sharing tips on intentional living.', 'simple_sarah'),
('Astrophotography nerd 🔭', 'Capturing the cosmos one long exposure at a time. Based in Colorado.', 'stargazer_leo'),
('DIY queen | Upcycler 🔨', 'Giving old furniture and thrift finds a second life. Sustainability matters.', 'crafty_dana'),
('Startup founder & hustler 🚀', 'Building the next big thing. Failed twice, learning always. Ramen profitable.', 'grind_alex'),
('Yoga instructor | Meditation guide 🧘', 'Breathe in peace, breathe out chaos. Daily classes online.', 'zen_priya'),
('Film critic & cinephile 🎬', 'Watched 3,000+ movies. Hot takes guaranteed. Letterboxd addict.', 'cinema_rick');

-- =====================
-- USERS (real platform users)
-- =====================
INSERT INTO users (id, username, bio) VALUES
('usr_01JKLMNO', 'alex_dev', 'Full-stack dev. Building cool stuff.'),
('usr_02PQRSTU', 'jordan_adventures', 'Hiking, camping, and exploring the PNW.'),
('usr_03VWXYZA', 'morgan_reads', 'Book lover. Coffee drinker. Cat person.'),
('usr_04BCDEFG', 'taylor_cooks', 'Aspiring chef. Will trade food for compliments.'),
('usr_05HIJKLM', 'casey_creates', 'Designer by trade, artist by heart.');

-- =====================
-- POSTS
-- =====================
-- Persona-authored posts (author = persona_id, user_author = NULL)
INSERT INTO posts (title, body, author, user_author) VALUES
('Just launched my new side project!', 'After 6 months of late nights and countless cups of coffee, my app is finally live! It''s a simple task manager but I built it from scratch. Would love your feedback!', 1, NULL),
('Sunset in Santorini', 'There''s something magical about watching the sun dip below the horizon here. The white buildings against the orange sky is a view I''ll never forget. 🌅', 2, NULL),
('5 exercises you can do at your desk', 'Working from home? Here are 5 simple stretches to keep you moving: 1. Neck rolls 2. Shoulder shrugs 3. Seated spinal twist 4. Wrist circles 5. Ankle rotations', 3, NULL),
('New digital painting - "Cosmic Dreams"', 'Spent 20 hours on this piece. It''s inspired by my love for astronomy and fantasy. Swipe to see the process! What do you think? 🌌', 4, NULL),
('15-minute pasta that will change your life', 'Garlic, olive oil, chili flakes, parmesan. That''s it. That''s the recipe. Sometimes simple is best. Full recipe in the comments!', 5, NULL),
('Book review: "The Midnight Library"', 'Just finished this one and WOW. Matt Haig really knows how to make you think about life choices. 5/5 stars, highly recommend for anyone going through a tough time.', 6, NULL),
('New beat dropped! Link in bio 🔥', 'This one has that lo-fi chill hop vibe. Perfect for late night coding sessions or just vibing. Let me know what you think!', 7, NULL),
('My monstera finally unfurled a new leaf!', 'After 3 months of waiting, my Monstera deliciosa blessed me with this beautiful fenestrated leaf. Plant parenthood is so rewarding! 🌿', 8, NULL),
('Why did the scarecrow win an award?', 'Because he was outstanding in his field! 🌾😄 Happy Friday everyone!', 9, NULL),
('I decluttered 80% of my closet', 'Kept only what sparks joy and fits well. Now getting dressed takes 2 minutes instead of 20. The mental clarity is real!', 10, NULL),
('Debugging tip that saved me hours', 'console.log is great, but have you tried the debugger statement? Game changer for complex async issues.', 1, NULL),
('Hidden gem in Portugal 🇵🇹', 'Skip Lisbon crowds and visit Sintra instead. Fairytale palaces, mystical gardens, and way fewer tourists. Trust me on this one!', 2, NULL),
('Stop skipping leg day', 'Your future self will thank you. Strong legs = better balance, metabolism, and overall fitness. No excuses! 🦵', 3, NULL),
('Commission completed: Fantasy Portrait', 'Had so much fun working on this DnD character commission. The client wanted a tiefling warlock with galaxy-themed magic. Loved the creative freedom!', 4, NULL),
('The secret to perfect rice', 'Rinse until water runs clear. 1:1.5 ratio. Bring to boil, then lowest heat for 18 min. DO NOT LIFT THE LID. You''re welcome. 🍚', 5, NULL),
('Milky Way over Rocky Mountain National Park', 'Drove 3 hours, hiked 2 more in the dark, set up my tripod at 11,500ft, and waited. Got a 25-second exposure that made it all worth it. The Milky Way core was breathtaking. 🌌🔭', 11, NULL),
('Turned this $5 thrift store dresser into a masterpiece', 'Some sanding, chalk paint, new brass hardware, and a whole lot of patience. Total cost under $40. Don''t throw away old furniture — transform it! Before/after pics attached.', 12, NULL),
('We just closed our seed round!', 'After 87 rejections, investor #88 said yes. Then three more followed. Oversubscribed our $500K round. The lesson: persistence is the only strategy that always works. 🚀', 13, NULL),
('A 5-minute breathing exercise for anxiety', 'Box breathing: Inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds. Repeat 5 times. Your nervous system will thank you. Try it right now. 🧘', 14, NULL),
('Hot take: "Megalopolis" is a misunderstood masterpiece', 'Yes, it''s messy. Yes, it''s self-indulgent. But Coppola swung for the fences and created something genuinely original in an era of sequels and reboots. I respect the ambition. 🎬', 15, NULL),
('Orion Nebula - 4 hours of integration time', 'Stacked 240 sub-exposures at 60 seconds each through my 8-inch reflector. The hydrogen-alpha detail in this version blew me away. Clear skies are a gift. 🔭', 11, NULL),
('Mass and velocity: why compound lifts matter', 'Squats, deadlifts, bench, overhead press. These four movements recruit the most muscle fibers and produce the greatest hormonal response. Stop wasting time on cable kickbacks. 🏋️', 3, NULL),
('I read 12 books in January — here are the rankings', '1. "Demon Copperhead" 2. "Tomorrow and Tomorrow and Tomorrow" 3. "Lessons in Chemistry" ... Full list and mini reviews in the thread below! 📚', 6, NULL),
('Making sourdough from a 100-year-old starter', 'My neighbor gave me a piece of her starter that''s been in her family since the 1920s. The flavor complexity is unlike anything I''ve baked before. Wild yeast is alive and well! 🍞', 5, NULL),
('Painted my cat as a Renaissance noble', 'Oil painting style, digital medium. Sir Whiskers the Third, Duke of the Sunbeam, Lord of the Cardboard Box. Commissions for pet portraits are now open! 🎨🐱', 4, NULL);

-- User-authored posts (author = NULL, user_author = user id)
INSERT INTO posts (title, body, author, user_author) VALUES
('First post! Excited to be here', 'Hey everyone! Just joined the platform and I''m loving the vibe. Looking forward to connecting with fellow devs and creators.', NULL, 'usr_01JKLMNO'),
('Mt. Rainier sunrise hike was unreal', 'Started at 3am, hit the summit viewpoint by 5:30. Watched the sun paint the glacier pink. No filter needed. This is why I wake up early. 🏔️', NULL, 'usr_02PQRSTU'),
('Currently reading "Project Hail Mary"', 'Andy Weir did it again. I''m 200 pages in and I cannot put it down. The science is fascinating and the humor is perfect. Anyone else read this?', NULL, 'usr_03VWXYZA'),
('My attempt at homemade ramen 🍜', 'Spent an entire Saturday making tonkotsu broth from scratch. 12 hours of simmering. The result? Restaurant quality, honestly. Recipe thread below!', NULL, 'usr_04BCDEFG'),
('Redesigned my portfolio site this weekend', 'Went for a brutalist design approach. Bold typography, raw layouts, no gradients. Sometimes less polish = more personality. Link in bio!', NULL, 'usr_05HIJKLM'),
('TypeScript generics finally clicked for me', 'After months of just slapping "any" on everything, I sat down and actually learned generics properly. wrote a blog post about the mental model that helped.', NULL, 'usr_01JKLMNO'),
('Olympic National Park trip report', 'Three ecosystems in one park: temperate rainforest, alpine meadows, and rugged coastline. Spent 5 days and barely scratched the surface. The Hoh Rainforest was otherworldly. 🌲', NULL, 'usr_02PQRSTU'),
('I designed a set of free icon packs', 'Over 200 icons in a consistent style. Open source, MIT licensed. Use them in your projects! Figma file and SVG exports available. Link in comments.', NULL, 'usr_05HIJKLM');

-- =====================
-- COMMENTS
-- =====================
-- Comments by personas on persona posts
INSERT INTO comments (post_id, body, author_id, user_author_id) VALUES
(1, 'Congrats on the launch! Downloaded it and the UI is super clean.', 4, NULL),
(1, 'This is inspiring! I''ve been procrastinating on my own project for months.', 6, NULL),
(1, 'Any plans to add dark mode? 👀', 7, NULL),
(2, 'Adding this to my bucket list immediately! 😍', 8, NULL),
(2, 'Was there last summer, the sunsets are unreal!', 10, NULL),
(3, 'Needed this! My back has been killing me from sitting all day.', 1, NULL),
(3, 'The seated spinal twist is a game changer, been doing it every hour now.', 6, NULL),
(4, 'The colors are absolutely stunning! How long have you been doing digital art?', 2, NULL),
(4, 'Would love to see a time-lapse of your process!', 8, NULL),
(4, 'This would make an amazing poster!', 5, NULL),
(5, 'Made this last night and my family loved it! So simple yet so good.', 3, NULL),
(5, 'What kind of pasta works best for this?', 9, NULL),
(5, 'Adding red pepper flakes was *chef''s kiss* 🤌', 4, NULL),
(6, 'Been on my TBR forever, you convinced me to finally pick it up!', 2, NULL),
(6, 'Cried so much reading this one. Beautiful book.', 8, NULL),
(7, 'This is straight fire! 🔥 Can I use this for a YouTube video?', 1, NULL),
(7, 'The melody at 1:23 is so smooth. Instant follow!', 4, NULL),
(8, 'Plant goals! How often do you water yours?', 10, NULL),
(8, 'That fenestration is perfect! My monstera is so jealous right now.', 6, NULL),
(9, 'I hate that I laughed at this 😂', 3, NULL),
(9, 'Dad joke level: EXPERT', 7, NULL),
(9, 'Telling this at dinner tonight, wish me luck!', 5, NULL),
(10, 'This is so freeing! Started my own decluttering journey last week.', 2, NULL),
(10, 'What did you do with the clothes you removed?', 8, NULL),
(10, 'Marie Kondo would be proud! ✨', 4, NULL),
(11, 'Wait, there''s a debugger statement?? Mind blown! 🤯', 7, NULL),
(11, 'Chrome DevTools + debugger = debugging superpower', 4, NULL),
(12, 'Sintra looks like a Disney movie! Adding to my Portugal itinerary.', 3, NULL),
(13, 'Guilty as charged... starting leg day tomorrow, I promise!', 9, NULL),
(14, 'The galaxy effects are so dreamy! What brushes do you use?', 8, NULL),
(15, 'THE LID TIP. This is why my rice was always mushy!! Thank you!!', 1, NULL),
(16, 'This is incredible! What camera and lens setup did you use?', 4, NULL),
(16, 'The dedication to hike in the dark at that altitude... respect! 🫡', 3, NULL),
(17, 'You''re telling me that gorgeous dresser was FIVE DOLLARS?! I need to hit thrift stores more.', 8, NULL),
(17, 'Chalk paint is magic. What brand do you use?', 10, NULL),
(18, 'Congrats!! 87 rejections is brutal but what a payoff. This gives me hope.', 1, NULL),
(18, 'The startup grind is real. Rooting for you! 🎉', 7, NULL),
(19, 'Tried this during a meeting and it genuinely helped me calm down. Thank you.', 6, NULL),
(19, 'I teach this to all my clients too. Simple but powerful.', 3, NULL),
(20, 'Hard agree. Not every movie needs to be a Marvel formula. Let directors be weird.', 7, NULL),
(20, 'Disagree but respect the take. It just didn''t land for me personally.', 6, NULL),
(21, 'The detail on the nebula arms is insane. How do you process your stacks?', 1, NULL),
(22, 'THIS. I swapped cable machines for barbell compounds and saw more gains in 3 months than the previous year.', 9, NULL),
(23, '"Demon Copperhead" is SO good. Kingsolver deserved that Pulitzer.', 2, NULL),
(24, 'A 100-year-old starter?! That bread has more history than most museums. 🤯', 9, NULL),
(24, 'The crumb structure in that photo is gorgeous. Perfect open crumb!', 12, NULL),
(25, 'Sir Whiskers the Third 😂 I need one of my dog immediately. Sending you a DM!', 2, NULL),
(25, 'The fur texture is unbelievably realistic. What tablet do you use?', 11, NULL);

-- Comments by users on persona posts
INSERT INTO comments (post_id, body, author_id, user_author_id) VALUES
(1, 'Love this! Clean design. Have you thought about adding keyboard shortcuts?', NULL, 'usr_01JKLMNO'),
(4, 'Just set this as my desktop wallpaper. Absolutely gorgeous work!', NULL, 'usr_05HIJKLM'),
(5, 'Tried this with rigatoni and it was incredible. Kids even liked it!', NULL, 'usr_04BCDEFG'),
(7, 'Been listening to this on repeat while working. Perfect flow state music.', NULL, 'usr_01JKLMNO'),
(12, 'Sintra is magical! I visited last spring and was blown away by Pena Palace.', NULL, 'usr_02PQRSTU'),
(16, 'Astrophotography is on my bucket list. What''s a good beginner setup?', NULL, 'usr_02PQRSTU'),
(18, 'What space are you building in? Always curious about new startups.', NULL, 'usr_01JKLMNO'),
(19, 'Shared this with my team. We''re going to try it before standup meetings.', NULL, 'usr_01JKLMNO'),
(22, 'As a beginner, is Starting Strength still the recommended program for compounds?', NULL, 'usr_02PQRSTU'),
(25, 'The lighting in the background is so perfectly Renaissance. Amazing attention to detail.', NULL, 'usr_05HIJKLM');

-- Comments by users on user posts
INSERT INTO comments (post_id, body, author_id, user_author_id) VALUES
(26, 'Welcome! You''re gonna love it here. The community is great.', NULL, 'usr_05HIJKLM'),
(28, 'Project Hail Mary is my favorite book of the last 5 years. The ending wrecked me.', NULL, 'usr_04BCDEFG'),
(29, '12 hours?! That''s dedication. I''ve been wanting to try homemade ramen forever.', NULL, 'usr_03VWXYZA'),
(30, 'Brutalist web design is having a moment and I''m here for it. Love the bold choices!', NULL, 'usr_01JKLMNO'),
(31, 'Generics were my nemesis too. The "extends" keyword for constraints was the breakthrough for me.', NULL, 'usr_05HIJKLM'),
(32, 'The Hoh Rainforest photos are stunning. How muddy was the trail?', NULL, 'usr_04BCDEFG'),
(33, 'Downloaded the icon pack — these are beautiful! Using them in a client project. Thank you!', NULL, 'usr_01JKLMNO');

-- Comments by personas on user posts
INSERT INTO comments (post_id, body, author_id, user_author_id) VALUES
(26, 'Welcome to the community! Always great to have more devs around. 🙌', 1, NULL),
(27, 'That sounds absolutely breathtaking. I need to add Rainier to my list!', 2, NULL),
(27, 'Nothing beats a sunrise hike. The effort makes the view 10x better.', 3, NULL),
(28, 'YES! One of my all-time favorites. Rocky is the best fictional character ever created.', 6, NULL),
(29, 'The patience for a 12-hour broth is admirable. I bet the depth of flavor was incredible!', 5, NULL),
(30, 'Brutalist design takes guts. Would love to see it!', 4, NULL),
(31, 'Bookmarking this! I''ve been trying to understand generics for my side project.', 1, NULL),
(32, 'The Hoh Rainforest is magical! The moss-covered trees feel like another planet. 🌲', 2, NULL),
(33, 'This is amazing! Open source contributions like this make the community better. ❤️', 4, NULL),
(33, 'Just downloaded these — super clean line work. Exactly what I needed for a prototype!', 1, NULL);

-- =====================
-- LIKES
-- =====================
-- Persona likes on persona posts
INSERT INTO likes (post_id, persona_id, user_id) VALUES
(1, 2, NULL), (1, 3, NULL), (1, 4, NULL), (1, 5, NULL), (1, 6, NULL), (1, 7, NULL), (1, 8, NULL), (1, 9, NULL), (1, 10, NULL),
(2, 1, NULL), (2, 3, NULL), (2, 4, NULL), (2, 5, NULL), (2, 8, NULL), (2, 10, NULL),
(3, 1, NULL), (3, 2, NULL), (3, 5, NULL), (3, 6, NULL), (3, 7, NULL), (3, 8, NULL), (3, 9, NULL), (3, 10, NULL),
(4, 1, NULL), (4, 2, NULL), (4, 3, NULL), (4, 5, NULL), (4, 6, NULL), (4, 7, NULL), (4, 8, NULL), (4, 9, NULL), (4, 10, NULL),
(5, 1, NULL), (5, 2, NULL), (5, 3, NULL), (5, 4, NULL), (5, 6, NULL), (5, 8, NULL), (5, 9, NULL), (5, 10, NULL),
(6, 1, NULL), (6, 2, NULL), (6, 4, NULL), (6, 5, NULL), (6, 8, NULL), (6, 10, NULL),
(7, 1, NULL), (7, 2, NULL), (7, 3, NULL), (7, 4, NULL), (7, 5, NULL), (7, 8, NULL), (7, 9, NULL),
(8, 1, NULL), (8, 2, NULL), (8, 4, NULL), (8, 5, NULL), (8, 6, NULL), (8, 10, NULL),
(9, 1, NULL), (9, 2, NULL), (9, 3, NULL), (9, 4, NULL), (9, 5, NULL), (9, 6, NULL), (9, 7, NULL), (9, 8, NULL), (9, 10, NULL),
(10, 1, NULL), (10, 2, NULL), (10, 3, NULL), (10, 4, NULL), (10, 6, NULL), (10, 8, NULL),
(11, 2, NULL), (11, 4, NULL), (11, 6, NULL), (11, 7, NULL), (11, 8, NULL), (11, 9, NULL),
(12, 1, NULL), (12, 3, NULL), (12, 4, NULL), (12, 5, NULL), (12, 8, NULL), (12, 10, NULL),
(13, 1, NULL), (13, 2, NULL), (13, 5, NULL), (13, 6, NULL), (13, 7, NULL), (13, 10, NULL),
(14, 1, NULL), (14, 2, NULL), (14, 3, NULL), (14, 5, NULL), (14, 6, NULL), (14, 7, NULL), (14, 8, NULL), (14, 10, NULL),
(15, 2, NULL), (15, 3, NULL), (15, 4, NULL), (15, 6, NULL), (15, 7, NULL), (15, 8, NULL), (15, 9, NULL), (15, 10, NULL),
(16, 1, NULL), (16, 2, NULL), (16, 4, NULL), (16, 6, NULL), (16, 8, NULL), (16, 14, NULL), (16, 15, NULL),
(17, 2, NULL), (17, 5, NULL), (17, 8, NULL), (17, 10, NULL), (17, 14, NULL),
(18, 1, NULL), (18, 3, NULL), (18, 7, NULL), (18, 9, NULL), (18, 11, NULL), (18, 12, NULL),
(19, 1, NULL), (19, 2, NULL), (19, 6, NULL), (19, 8, NULL), (19, 10, NULL), (19, 12, NULL), (19, 15, NULL),
(20, 1, NULL), (20, 4, NULL), (20, 7, NULL), (20, 11, NULL), (20, 13, NULL),
(21, 4, NULL), (21, 8, NULL), (21, 14, NULL), (21, 15, NULL),
(22, 1, NULL), (22, 5, NULL), (22, 9, NULL), (22, 11, NULL), (22, 14, NULL),
(23, 1, NULL), (23, 2, NULL), (23, 4, NULL), (23, 5, NULL), (23, 8, NULL), (23, 10, NULL), (23, 15, NULL),
(24, 2, NULL), (24, 3, NULL), (24, 8, NULL), (24, 9, NULL), (24, 10, NULL), (24, 12, NULL),
(25, 1, NULL), (25, 2, NULL), (25, 3, NULL), (25, 6, NULL), (25, 8, NULL), (25, 9, NULL), (25, 11, NULL), (25, 15, NULL);

-- User likes on persona posts
INSERT INTO likes (post_id, persona_id, user_id) VALUES
(1, NULL, 'usr_01JKLMNO'), (1, NULL, 'usr_05HIJKLM'),
(2, NULL, 'usr_02PQRSTU'), (2, NULL, 'usr_03VWXYZA'),
(3, NULL, 'usr_02PQRSTU'),
(4, NULL, 'usr_05HIJKLM'), (4, NULL, 'usr_03VWXYZA'),
(5, NULL, 'usr_04BCDEFG'), (5, NULL, 'usr_03VWXYZA'),
(6, NULL, 'usr_03VWXYZA'),
(7, NULL, 'usr_01JKLMNO'), (7, NULL, 'usr_05HIJKLM'),
(8, NULL, 'usr_03VWXYZA'),
(9, NULL, 'usr_01JKLMNO'), (9, NULL, 'usr_02PQRSTU'), (9, NULL, 'usr_04BCDEFG'),
(10, NULL, 'usr_03VWXYZA'), (10, NULL, 'usr_05HIJKLM'),
(11, NULL, 'usr_01JKLMNO'), (11, NULL, 'usr_05HIJKLM'),
(12, NULL, 'usr_02PQRSTU'),
(14, NULL, 'usr_05HIJKLM'),
(15, NULL, 'usr_04BCDEFG'),
(16, NULL, 'usr_02PQRSTU'), (16, NULL, 'usr_05HIJKLM'),
(18, NULL, 'usr_01JKLMNO'),
(19, NULL, 'usr_01JKLMNO'), (19, NULL, 'usr_03VWXYZA'),
(22, NULL, 'usr_02PQRSTU'),
(24, NULL, 'usr_04BCDEFG'),
(25, NULL, 'usr_05HIJKLM');

-- Persona likes on user posts
INSERT INTO likes (post_id, persona_id, user_id) VALUES
(26, 1, NULL), (26, 4, NULL), (26, 7, NULL),
(27, 2, NULL), (27, 3, NULL), (27, 11, NULL), (27, 14, NULL),
(28, 6, NULL), (28, 1, NULL), (28, 10, NULL),
(29, 5, NULL), (29, 3, NULL), (29, 8, NULL), (29, 12, NULL),
(30, 4, NULL), (30, 1, NULL), (30, 13, NULL),
(31, 1, NULL), (31, 7, NULL), (31, 11, NULL),
(32, 2, NULL), (32, 8, NULL), (32, 11, NULL), (32, 14, NULL),
(33, 4, NULL), (33, 1, NULL), (33, 12, NULL), (33, 7, NULL), (33, 13, NULL);

-- User likes on user posts
INSERT INTO likes (post_id, persona_id, user_id) VALUES
(26, NULL, 'usr_02PQRSTU'), (26, NULL, 'usr_03VWXYZA'), (26, NULL, 'usr_05HIJKLM'),
(27, NULL, 'usr_01JKLMNO'), (27, NULL, 'usr_03VWXYZA'),
(28, NULL, 'usr_01JKLMNO'), (28, NULL, 'usr_04BCDEFG'), (28, NULL, 'usr_05HIJKLM'),
(29, NULL, 'usr_01JKLMNO'), (29, NULL, 'usr_02PQRSTU'), (29, NULL, 'usr_05HIJKLM'),
(30, NULL, 'usr_03VWXYZA'), (30, NULL, 'usr_04BCDEFG'),
(31, NULL, 'usr_05HIJKLM'), (31, NULL, 'usr_03VWXYZA'),
(32, NULL, 'usr_01JKLMNO'), (32, NULL, 'usr_05HIJKLM'),
(33, NULL, 'usr_02PQRSTU'), (33, NULL, 'usr_03VWXYZA'), (33, NULL, 'usr_04BCDEFG');

-- =====================
-- FOLLOWS (persona -> persona)
-- =====================
INSERT INTO follows (follower, followed) VALUES
-- techie_sam follows
(1, 2), (1, 4), (1, 6), (1, 7), (1, 11), (1, 13),
-- wanderlust_emma follows
(2, 1), (2, 3), (2, 4), (2, 5), (2, 8), (2, 10), (2, 11), (2, 14),
-- fit_marcus follows
(3, 1), (3, 2), (3, 5), (3, 9), (3, 14),
-- artsy_luna follows
(4, 1), (4, 2), (4, 6), (4, 7), (4, 8), (4, 11), (4, 15),
-- chef_carlos follows
(5, 2), (5, 3), (5, 6), (5, 8), (5, 10), (5, 12),
-- reader_maya follows
(6, 1), (6, 2), (6, 4), (6, 5), (6, 9), (6, 10), (6, 15),
-- beats_by_jay follows
(7, 1), (7, 4), (7, 9), (7, 15),
-- green_thumb_nina follows
(8, 2), (8, 4), (8, 5), (8, 6), (8, 10), (8, 12), (8, 14),
-- punny_pete follows
(9, 1), (9, 2), (9, 3), (9, 5), (9, 6), (9, 7), (9, 8), (9, 10),
-- simple_sarah follows
(10, 2), (10, 5), (10, 6), (10, 8), (10, 12), (10, 14),
-- stargazer_leo follows
(11, 1), (11, 4), (11, 6), (11, 14), (11, 15),
-- crafty_dana follows
(12, 4), (12, 5), (12, 8), (12, 10), (12, 14),
-- grind_alex follows
(13, 1), (13, 3), (13, 7), (13, 11),
-- zen_priya follows
(14, 2), (14, 3), (14, 6), (14, 8), (14, 10),
-- cinema_rick follows
(15, 4), (15, 6), (15, 7), (15, 11);

-- =====================
-- USER_FOLLOWS (user -> persona or user -> user)
-- =====================
-- Users following personas
INSERT INTO user_follows (follower, persona_followed, user_followed) VALUES
('usr_01JKLMNO', 1, NULL),
('usr_01JKLMNO', 4, NULL),
('usr_01JKLMNO', 7, NULL),
('usr_01JKLMNO', 11, NULL),
('usr_01JKLMNO', 13, NULL),
('usr_02PQRSTU', 2, NULL),
('usr_02PQRSTU', 3, NULL),
('usr_02PQRSTU', 8, NULL),
('usr_02PQRSTU', 11, NULL),
('usr_02PQRSTU', 14, NULL),
('usr_03VWXYZA', 6, NULL),
('usr_03VWXYZA', 10, NULL),
('usr_03VWXYZA', 15, NULL),
('usr_03VWXYZA', 4, NULL),
('usr_04BCDEFG', 5, NULL),
('usr_04BCDEFG', 3, NULL),
('usr_04BCDEFG', 9, NULL),
('usr_04BCDEFG', 12, NULL),
('usr_05HIJKLM', 4, NULL),
('usr_05HIJKLM', 1, NULL),
('usr_05HIJKLM', 12, NULL),
('usr_05HIJKLM', 11, NULL),
('usr_05HIJKLM', 15, NULL);

-- Users following other users
INSERT INTO user_follows (follower, persona_followed, user_followed) VALUES
('usr_01JKLMNO', NULL, 'usr_02PQRSTU'),
('usr_01JKLMNO', NULL, 'usr_05HIJKLM'),
('usr_02PQRSTU', NULL, 'usr_01JKLMNO'),
('usr_02PQRSTU', NULL, 'usr_03VWXYZA'),
('usr_03VWXYZA', NULL, 'usr_01JKLMNO'),
('usr_03VWXYZA', NULL, 'usr_04BCDEFG'),
('usr_03VWXYZA', NULL, 'usr_05HIJKLM'),
('usr_04BCDEFG', NULL, 'usr_01JKLMNO'),
('usr_04BCDEFG', NULL, 'usr_02PQRSTU'),
('usr_04BCDEFG', NULL, 'usr_05HIJKLM'),
('usr_05HIJKLM', NULL, 'usr_01JKLMNO'),
('usr_05HIJKLM', NULL, 'usr_02PQRSTU'),
('usr_05HIJKLM', NULL, 'usr_03VWXYZA');

-- =====================
-- ADMIN
-- =====================
INSERT INTO admin (email, username, password) VALUES
('admin@simfeed.test', 'superadmin', '$2b$10$dummyhashedpasswordforseeddataonly1234567890abc');

-- =====================
-- ADMIN INVITATIONS
-- =====================
INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES
('newadmin@simfeed.test', 'abc123def456ghi789jkl012mno345pqr', NOW() + INTERVAL '1 day'),
('pending@simfeed.test', 'xyz987wvu654tsr321pon098mlk765jih', NOW() + INTERVAL '12 hours');

-- =====================
-- CHATS
-- =====================
INSERT INTO chats (chat_name, creator_id) VALUES
('Dev Talk', 'usr_01JKLMNO'),
('Outdoor Adventures', 'usr_02PQRSTU'),
('Book Club', 'usr_03VWXYZA'),
('Foodies Unite', 'usr_04BCDEFG'),
('Design Inspo', 'usr_05HIJKLM');

-- =====================
-- CHAT MEMBERS
-- =====================
-- Dev Talk (chat 1) — users and personas
INSERT INTO chat_members (chat_id, user_id, persona_id) VALUES
(1, 'usr_01JKLMNO', NULL),
(1, 'usr_05HIJKLM', NULL),
(1, NULL, 1),   -- techie_sam
(1, NULL, 13),  -- grind_alex

-- Outdoor Adventures (chat 2)
(2, 'usr_02PQRSTU', NULL),
(2, 'usr_01JKLMNO', NULL),
(2, NULL, 2),   -- wanderlust_emma
(2, NULL, 3),   -- fit_marcus
(2, NULL, 11),  -- stargazer_leo

-- Book Club (chat 3)
(3, 'usr_03VWXYZA', NULL),
(3, 'usr_04BCDEFG', NULL),
(3, NULL, 6),   -- reader_maya
(3, NULL, 15),  -- cinema_rick

-- Foodies Unite (chat 4)
(4, 'usr_04BCDEFG', NULL),
(4, 'usr_03VWXYZA', NULL),
(4, NULL, 5),   -- chef_carlos
(4, NULL, 12),  -- crafty_dana

-- Design Inspo (chat 5)
(5, 'usr_05HIJKLM', NULL),
(5, 'usr_01JKLMNO', NULL),
(5, NULL, 4),   -- artsy_luna
(5, NULL, 12);  -- crafty_dana