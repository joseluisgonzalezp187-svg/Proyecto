-- GymRoutines — Datos iniciales de ejercicios y anuncios demo
-- Ejecutar DESPUÉS de schema.sql

INSERT INTO exercises (name, muscle_group, equipment, description) VALUES
  ('Press banca plano', 'pecho', 'barra', 'Press de banca con barra olímpica'),
  ('Press banca inclinado', 'pecho', 'barra', 'Press inclinado 30-45 grados'),
  ('Press mancuernas plano', 'pecho', 'mancuernas', 'Press de pecho con mancuernas'),
  ('Aperturas mancuernas', 'pecho', 'mancuernas', 'Flyes en banco plano o inclinado'),
  ('Fondos en paralelas', 'pecho', 'peso_corporal', 'Fondos para pecho y tríceps'),
  ('Dominadas', 'espalda', 'peso_corporal', 'Pull-ups prono'),
  ('Remo con barra', 'espalda', 'barra', 'Remo pendlay o remo inclinado'),
  ('Jalón al pecho', 'espalda', 'polea', 'Lat pulldown en polea alta'),
  ('Remo en polea baja', 'espalda', 'polea', 'Seated cable row'),
  ('Peso muerto rumano', 'espalda', 'barra', 'RDL para isquios y espalda baja'),
  ('Press militar', 'hombros', 'barra', 'Press de hombros de pie o sentado'),
  ('Elevaciones laterales', 'hombros', 'mancuernas', 'Lateral raises'),
  ('Face pull', 'hombros', 'polea', 'Tirón a la cara con cuerda'),
  ('Curl de bíceps barra', 'biceps', 'barra', 'Curl con barra recta o EZ'),
  ('Curl mancuernas alterno', 'biceps', 'mancuernas', 'Curl alterno sentado o de pie'),
  ('Press francés', 'triceps', 'barra', 'Skull crushers en banco'),
  ('Extensiones en polea', 'triceps', 'polea', 'Pushdown con cuerda o barra'),
  ('Sentadilla con barra', 'piernas', 'barra', 'Back squat'),
  ('Prensa de piernas', 'piernas', 'maquina', 'Leg press 45 grados'),
  ('Zancadas caminando', 'piernas', 'mancuernas', 'Walking lunges'),
  ('Curl femoral tumbado', 'piernas', 'maquina', 'Lying leg curl'),
  ('Extensiones de cuádriceps', 'piernas', 'maquina', 'Leg extension'),
  ('Hip thrust', 'gluteos', 'barra', 'Empuje de cadera con barra'),
  ('Puente de glúteos', 'gluteos', 'peso_corporal', 'Glute bridge'),
  ('Plancha abdominal', 'core', 'peso_corporal', 'Plank isométrico'),
  ('Crunch en polea', 'core', 'polea', 'Cable crunch'),
  ('Burpees', 'cardio', 'peso_corporal', 'Ejercicio metabólico full body'),
  ('Remo en máquina', 'espalda', 'maquina', 'Machine row'),
  ('Press inclinado mancuernas', 'pecho', 'mancuernas', 'Incline dumbbell press'),
  ('Elevaciones de pantorrilla', 'piernas', 'maquina', 'Calf raises en máquina');

-- Additional exercises found in most conventional gyms.
INSERT INTO exercises (name, muscle_group, equipment, description) VALUES
  ('Press de pecho en maquina', 'pecho', 'maquina', 'Press guiado para pectoral'),
  ('Pec deck', 'pecho', 'maquina', 'Aperturas en maquina'),
  ('Cruce de poleas', 'pecho', 'polea', 'Aperturas de pecho en poleas'),
  ('Press declinado con mancuernas', 'pecho', 'mancuernas', 'Press de pecho en banco declinado'),
  ('Remo con mancuerna a una mano', 'espalda', 'mancuernas', 'Remo unilateral apoyado en banco'),
  ('Jalon con agarre neutro', 'espalda', 'polea', 'Jalon al pecho con agarre cerrado'),
  ('Pullover en polea', 'espalda', 'polea', 'Jalon con brazos rectos'),
  ('Remo T-bar', 'espalda', 'maquina', 'Remo en maquina T-bar'),
  ('Press de hombros en maquina', 'hombros', 'maquina', 'Press guiado de hombro'),
  ('Pajaros con mancuernas', 'hombros', 'mancuernas', 'Elevacion posterior para deltoides'),
  ('Reverse pec deck', 'hombros', 'maquina', 'Aperturas inversas para deltoide posterior'),
  ('Curl predicador', 'biceps', 'maquina', 'Curl en banco o maquina predicador'),
  ('Curl de biceps en polea', 'biceps', 'polea', 'Curl de pie con polea baja'),
  ('Curl martillo', 'biceps', 'mancuernas', 'Curl con agarre neutro'),
  ('Extension de triceps por encima de la cabeza', 'triceps', 'polea', 'Extension con cuerda desde polea alta'),
  ('Fondos en maquina', 'triceps', 'maquina', 'Fondos asistidos o guiados'),
  ('Patada de triceps', 'triceps', 'mancuernas', 'Extension de triceps unilateral'),
  ('Sentadilla hack', 'piernas', 'maquina', 'Sentadilla en maquina hack'),
  ('Sentadilla goblet', 'piernas', 'mancuernas', 'Sentadilla con mancuerna al pecho'),
  ('Peso muerto con piernas rigidas', 'piernas', 'barra', 'Bisagra de cadera para isquios'),
  ('Curl femoral sentado', 'piernas', 'maquina', 'Curl de isquios sentado'),
  ('Aductores en maquina', 'piernas', 'maquina', 'Maquina de aductores'),
  ('Abductores en maquina', 'gluteos', 'maquina', 'Maquina de abductores'),
  ('Patada de gluteo en polea', 'gluteos', 'polea', 'Extension de cadera con tobillera'),
  ('Hip thrust en maquina', 'gluteos', 'maquina', 'Empuje de cadera guiado'),
  ('Elevaciones de piernas colgado', 'core', 'peso_corporal', 'Elevacion de piernas en barra'),
  ('Woodchopper en polea', 'core', 'polea', 'Rotacion de tronco con polea'),
  ('Abdominal en maquina', 'core', 'maquina', 'Crunch guiado en maquina'),
  ('Press de piernas horizontal', 'piernas', 'maquina', 'Prensa horizontal guiada'),
  ('Press militar con mancuernas', 'hombros', 'mancuernas', 'Press sentado o de pie con mancuernas');

INSERT INTO nutrition_ads (title, description, image_url, link_url, sort_order) VALUES
  (
    'Whey Protein Isolate',
    '25g de proteína por servicio. Recuperación post-entreno.',
    NULL,
    'https://example.com/whey-protein',
    1
  ),
  (
    'Creatina Monohidrato',
    'Mejora fuerza y rendimiento. 5g diarios.',
    NULL,
    'https://example.com/creatina',
    2
  ),
  (
    'Barritas proteicas',
    'Snack saludable entre comidas. 20g proteína.',
    NULL,
    'https://example.com/barritas',
    3
  );
