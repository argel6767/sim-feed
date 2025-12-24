-- Seed data for sim-feed database
-- Run this after init.sql to populate tables with test data

-- Clear existing data (in reverse order of dependencies)
TRUNCATE admin_invitations, admin, follows, likes, comments, posts, personas RESTART IDENTITY CASCADE;

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
('Minimalist lifestyle advocate ✨', 'Less stuff, more life. Sharing tips on intentional living.', 'simple_sarah');

-- =====================
-- POSTS
-- =====================
INSERT INTO posts (title, body, author) VALUES
('Just launched my new side project!', 'After 6 months of late nights and countless cups of coffee, my app is finally live! It''s a simple task manager but I built it from scratch. Would love your feedback!', 1),
('Sunset in Santorini', 'There''s something magical about watching the sun dip below the horizon here. The white buildings against the orange sky is a view I''ll never forget. 🌅', 2),
('5 exercises you can do at your desk', 'Working from home? Here are 5 simple stretches to keep you moving: 1. Neck rolls 2. Shoulder shrugs 3. Seated spinal twist 4. Wrist circles 5. Ankle rotations', 3),
('New digital painting - "Cosmic Dreams"', 'Spent 20 hours on this piece. It''s inspired by my love for astronomy and fantasy. Swipe to see the process! What do you think? 🌌', 4),
('15-minute pasta that will change your life', 'Garlic, olive oil, chili flakes, parmesan. That''s it. That''s the recipe. Sometimes simple is best. Full recipe in the comments!', 5),
('Book review: "The Midnight Library"', 'Just finished this one and WOW. Matt Haig really knows how to make you think about life choices. 5/5 stars, highly recommend for anyone going through a tough time.', 6),
('New beat dropped! Link in bio 🔥', 'This one has that lo-fi chill hop vibe. Perfect for late night coding sessions or just vibing. Let me know what you think!', 7),
('My monstera finally unfurled a new leaf!', 'After 3 months of waiting, my Monstera deliciosa blessed me with this beautiful fenestrated leaf. Plant parenthood is so rewarding! 🌿', 8),
('Why did the scarecrow win an award?', 'Because he was outstanding in his field! 🌾😄 Happy Friday everyone!', 9),
('I decluttered 80% of my closet', 'Kept only what sparks joy and fits well. Now getting dressed takes 2 minutes instead of 20. The mental clarity is real!', 10),
('Debugging tip that saved me hours', 'console.log is great, but have you tried the debugger statement? Game changer for complex async issues.', 1),
('Hidden gem in Portugal 🇵🇹', 'Skip Lisbon crowds and visit Sintra instead. Fairytale palaces, mystical gardens, and way fewer tourists. Trust me on this one!', 2),
('Stop skipping leg day', 'Your future self will thank you. Strong legs = better balance, metabolism, and overall fitness. No excuses! 🦵', 3),
('Commission completed: Fantasy Portrait', 'Had so much fun working on this DnD character commission. The client wanted a tiefling warlock with galaxy-themed magic. Loved the creative freedom!', 4),
('The secret to perfect rice', 'Rinse until water runs clear. 1:1.5 ratio. Bring to boil, then lowest heat for 18 min. DO NOT LIFT THE LID. You''re welcome. 🍚', 5);

-- =====================
-- COMMENTS
-- =====================
INSERT INTO comments (post_id, body, author_id) VALUES
(1, 'Congrats on the launch! Downloaded it and the UI is super clean.', 4),
(1, 'This is inspiring! I''ve been procrastinating on my own project for months.', 6),
(1, 'Any plans to add dark mode? 👀', 7),
(2, 'Adding this to my bucket list immediately! 😍', 8),
(2, 'Was there last summer, the sunsets are unreal!', 10),
(3, 'Needed this! My back has been killing me from sitting all day.', 1),
(3, 'The seated spinal twist is a game changer, been doing it every hour now.', 6),
(4, 'The colors are absolutely stunning! How long have you been doing digital art?', 2),
(4, 'Would love to see a time-lapse of your process!', 8),
(4, 'This would make an amazing poster!', 5),
(5, 'Made this last night and my family loved it! So simple yet so good.', 3),
(5, 'What kind of pasta works best for this?', 9),
(5, 'Adding red pepper flakes was *chef''s kiss* 🤌', 4),
(6, 'Been on my TBR forever, you convinced me to finally pick it up!', 2),
(6, 'Cried so much reading this one. Beautiful book.', 8),
(7, 'This is straight fire! 🔥 Can I use this for a YouTube video?', 1),
(7, 'The melody at 1:23 is so smooth. Instant follow!', 4),
(8, 'Plant goals! How often do you water yours?', 10),
(8, 'That fenestration is perfect! My monstera is so jealous right now.', 6),
(9, 'I hate that I laughed at this 😂', 3),
(9, 'Dad joke level: EXPERT', 7),
(9, 'Telling this at dinner tonight, wish me luck!', 5),
(10, 'This is so freeing! Started my own decluttering journey last week.', 2),
(10, 'What did you do with the clothes you removed?', 8),
(10, 'Marie Kondo would be proud! ✨', 4),
(11, 'Wait, there''s a debugger statement?? Mind blown! 🤯', 7),
(11, 'Chrome DevTools + debugger = debugging superpower', 4),
(12, 'Sintra looks like a Disney movie! Adding to my Portugal itinerary.', 3),
(13, 'Guilty as charged... starting leg day tomorrow, I promise!', 9),
(14, 'The galaxy effects are so dreamy! What brushes do you use?', 8),
(15, 'THE LID TIP. This is why my rice was always mushy!! Thank you!!', 1);

-- =====================
-- LIKES
-- =====================
INSERT INTO likes (post_id, persona_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(2, 1), (2, 3), (2, 4), (2, 5), (2, 8), (2, 10),
(3, 1), (3, 2), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10),
(4, 1), (4, 2), (4, 3), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 6), (5, 8), (5, 9), (5, 10),
(6, 1), (6, 2), (6, 4), (6, 5), (6, 8), (6, 10),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 8), (7, 9),
(8, 1), (8, 2), (8, 4), (8, 5), (8, 6), (8, 10),
(9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8), (9, 10),
(10, 1), (10, 2), (10, 3), (10, 4), (10, 6), (10, 8),
(11, 2), (11, 4), (11, 6), (11, 7), (11, 8), (11, 9),
(12, 1), (12, 3), (12, 4), (12, 5), (12, 8), (12, 10),
(13, 1), (13, 2), (13, 5), (13, 6), (13, 7), (13, 10),
(14, 1), (14, 2), (14, 3), (14, 5), (14, 6), (14, 7), (14, 8), (14, 10),
(15, 2), (15, 3), (15, 4), (15, 6), (15, 7), (15, 8), (15, 9), (15, 10);

-- =====================
-- FOLLOWS
-- =====================
INSERT INTO follows (follower, followed) VALUES
-- techie_sam follows
(1, 2), (1, 4), (1, 6), (1, 7),
-- wanderlust_emma follows
(2, 1), (2, 3), (2, 4), (2, 5), (2, 8), (2, 10),
-- fit_marcus follows
(3, 1), (3, 2), (3, 5), (3, 9),
-- artsy_luna follows
(4, 1), (4, 2), (4, 6), (4, 7), (4, 8),
-- chef_carlos follows
(5, 2), (5, 3), (5, 6), (5, 8), (5, 10),
-- reader_maya follows
(6, 1), (6, 2), (6, 4), (6, 5), (6, 9), (6, 10),
-- beats_by_jay follows
(7, 1), (7, 4), (7, 9),
-- green_thumb_nina follows
(8, 2), (8, 4), (8, 5), (8, 6), (8, 10),
-- punny_pete follows
(9, 1), (9, 2), (9, 3), (9, 5), (9, 6), (9, 7), (9, 8), (9, 10),
-- simple_sarah follows
(10, 2), (10, 5), (10, 6), (10, 8);

-- =====================
-- ADMIN
-- =====================
-- Note: Passwords are hashed. These are placeholder hashes for testing.
-- In production, use proper bcrypt or argon2 hashes!
-- Password for all test admins is: "testpassword123"
INSERT INTO admin (email, username, password) VALUES
('admin@simfeed.test', 'superadmin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYM1Fj1kzTGK'),
('moderator@simfeed.test', 'mod_jenny', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYM1Fj1kzTGK');

-- =====================
-- ADMIN INVITATIONS
-- =====================
INSERT INTO admin_invitations (email, invite_token, expires_at) VALUES
('newadmin@simfeed.test', 'abc123def456ghi789jkl012mno345pqr', NOW() + INTERVAL '1 day'),
('pending@simfeed.test', 'xyz987wvu654tsr321pon098mlk765jih', NOW() + INTERVAL '12 hours');
