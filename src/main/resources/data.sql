MERGE INTO users (email, prenom, nom, equipe, role) KEY(email)
    VALUES
    ('jihane.atiq@disney.com',           'Jihane', 'Atiq',             'Développement digital', 'ADMIN'),
    ('louise.amaladasse@disney.com',     'Louise', 'Amaladasse',       'Développement digital', 'USER'),
    ('alba.avesada.calderon@disney.com', 'Alba',   'Avesada Calderon', 'Dining',                'USER'),
    ('cyril.macaluso@disney.com',        'Cyril',  'Macaluso',         'Dining',                'USER'),
    ('marie.dupont@disney.com',          'Marie',  'Dupont',           'Développement digital', 'USER');