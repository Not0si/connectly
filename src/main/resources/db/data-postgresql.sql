INSERT INTO public.role(name) VALUES
	('client'),
	('admin');

INSERT INTO chat_type (name) VALUES
    ('self'),
	('direct'),
	('group');

INSERT INTO media_type(name) VALUES
	('image'),
	('audio'),
	('video'),
	('document');

INSERT INTO participant_role(name) VALUES
	('admin'),
	('member');

INSERT INTO "user"(user_name, password, avatar_url, role_id) VALUES
    ('John Doe', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png', 1),
    ('Jane Smith', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_2.png', 1),
    ('Alice Johnson', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png', 1),
    ('Michael Brown', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_4.png', 1),
    ('Emily Davis', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png', 1),
    ('David Wilson', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png', 1),
    ('Sarah Miller', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png', 1),
    ('Daniel Garcia', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png', 1),
    ('Emma Anderson', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_9.png', 1),
    ('William Taylor', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_10.png', 1),
    ('Olivia Moore', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_11.png', 1),
    ('James Martinez', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_12.png', 1),
    ('Mia Clark', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_13.png', 1),
    ('Noah Lee', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_14.png', 1),
    ('Ava White', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_15.png', 1),
    ('Logan Harris', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_16.png', 1),
    ('Sophia Lopez', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_17.png', 1),
    ('Lucas Hall', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_18.png', 1),
    ('Charlotte King', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_19.png', 1),
    ('Jack Scott', '$2a$10$7bAk8QMIc/Fe2UzxKcbpPOeKueMZ7eIfd2f0/aL4uwWxNK9AL9/pG', 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_20.png', 1);

