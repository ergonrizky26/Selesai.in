import * as chrono from 'chrono-node';

export function parseTaskInput(input: string) {
    // 1. NLP Pre-processing
    let processedInput = input.toLowerCase()
        .replace(/\bbesok\b/g, 'tomorrow')
        .replace(/\blusa\b/g, 'in 2 days')
        .replace(/\bhari ini\b/g, 'today')
        .replace(/\bminggu depan\b/g, 'next week')
        .replace(/\bjam\b/g, 'at');

    // 2. Parse Date
    const parsedResults = chrono.parse(processedInput, new Date(), { forwardDate: true });

    let dueDate: Date | null = null;
    let cleanTitle = input;

    if (parsedResults.length > 0) {
        const parsedDate = parsedResults[0];
        dueDate = parsedDate.start.date();

        cleanTitle = cleanTitle.toLowerCase()
            .replace(/\bbesok\b/gi, '')
            .replace(/\blusa\b/gi, '')
            .replace(/\bhari ini\b/gi, '')
            .replace(/\bminggu depan\b/gi, '')
            .replace(/jam \d{1,2}(:\d{2})?( ?pagi| ?siang| ?sore| ?malam)?/gi, '');
    }

    // 3. Ekstrak Project Tag (#)
    const projectRegex = /#(\w+)/;
    const projectMatch = cleanTitle.match(projectRegex);
    let projectName = null;

    if (projectMatch) {
        projectName = projectMatch[1];
        cleanTitle = cleanTitle.replace(projectMatch[0], '');
    }

    // LOGIKA BARU: 4. Ekstrak Multi-Labels (@)
    const labelRegex = /@(\w+)/g;
    const labels: string[] = [];
    let labelMatch;

    while ((labelMatch = labelRegex.exec(cleanTitle)) !== null) {
        labels.push(labelMatch[1].toLowerCase()); // Simpan label dalam huruf kecil
    }
    // Hapus semua teks @label dari judul utama
    cleanTitle = cleanTitle.replace(/@\w+/g, '');

    // 5. Bersihkan spasi dan Kapitalisasi
    cleanTitle = cleanTitle.trim().replace(/\s+/g, ' ');
    if (cleanTitle.length > 0) {
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    // LOGIKA BARU: 6. Ekstrak Priority (p1 - p4)
    const priorityRegex = /\bp([1-4])\b/i;
    const priorityMatch = cleanTitle.match(priorityRegex);
    let priority = 'p4'; // Default P4 (Normal)

    if (priorityMatch) {
        priority = priorityMatch[0].toLowerCase();
        cleanTitle = cleanTitle.replace(priorityRegex, '');
    }

    return {
        title: cleanTitle || 'Tugas Tanpa Judul',
        dueDate,
        projectName,
        labels: labels.length > 0 ? labels : null, // Kembalikan array label
        priority: priority,
    };
}