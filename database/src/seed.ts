import bcrypt from 'bcryptjs';
import { prisma } from './client.js';

const BCRYPT_ROUNDS = 10;

async function main() {
  // --- Users ---
  const adminHash = await bcrypt.hash('Admin@123456', BCRYPT_ROUNDS);
  const learnerHash = await bcrypt.hash('Learner@123456', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dudecourse.local' },
    update: {},
    create: {
      name: 'Admin Dude Course',
      email: 'admin@dudecourse.local',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@dudecourse.local' },
    update: {},
    create: {
      name: 'Learner Dude Course',
      email: 'learner@dudecourse.local',
      passwordHash: learnerHash,
      role: 'learner',
    },
  });

  // --- Courses ---
  const publishedCourse = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Introdução ao TypeScript',
      description: 'Aprenda os fundamentos do TypeScript do zero ao avançado.',
      status: 'published',
    },
  });

  await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Node.js Avançado (Em breve)',
      description: 'Curso em desenvolvimento — ainda não publicado.',
      status: 'draft',
    },
  });

  // --- Lessons (vinculadas ao curso publicado) ---
  const lesson1 = await prisma.lesson.upsert({
    where: { courseId_position: { courseId: publishedCourse.id, position: 1 } },
    update: {},
    create: {
      courseId: publishedCourse.id,
      title: 'O que é TypeScript?',
      description: 'Introdução à linguagem e seus benefícios.',
      youtubeUrl: 'https://www.youtube.com/watch?v=zeCDuo74uzA',
      position: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { courseId_position: { courseId: publishedCourse.id, position: 2 } },
    update: {},
    create: {
      courseId: publishedCourse.id,
      title: 'Tipos básicos',
      description: 'string, number, boolean, arrays e objetos.',
      youtubeUrl: 'https://www.youtube.com/watch?v=ahCwqrYpIuM',
      position: 2,
    },
  });

  await prisma.lesson.upsert({
    where: { courseId_position: { courseId: publishedCourse.id, position: 3 } },
    update: {},
    create: {
      courseId: publishedCourse.id,
      title: 'Interfaces e Types',
      description: 'Modelando dados com interfaces e type aliases.',
      youtubeUrl: 'https://www.youtube.com/watch?v=crjIq7LEAYw',
      position: 3,
    },
  });

  // --- Enrollment ---
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: publishedCourse.id } },
    update: {},
    create: {
      userId: learner.id,
      courseId: publishedCourse.id,
    },
  });

  // --- LessonProgress (1 aula concluída) ---
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: learner.id, lessonId: lesson1.id } },
    update: {},
    create: {
      userId: learner.id,
      courseId: publishedCourse.id,
      lessonId: lesson1.id,
    },
  });

  console.info('Seed concluído:', {
    admin: admin.email,
    learner: learner.email,
    publishedCourse: publishedCourse.title,
    enrollment: enrollment.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Database seed failed', error);
    await prisma.$disconnect();
    process.exit(1);
  });