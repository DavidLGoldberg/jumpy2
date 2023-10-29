// achievements.ts
interface Achievement {
    level: string;
    emoji: string;
    message: string;
}

export const achievements: Record<number, Achievement> = {
    0: {
        level: 'Sloth',
        emoji: '🦥',
        message: "You don't really jump much do you?",
    },
    100: {
        level: 'Grasshopper',
        emoji: '🦗',
        message:
            'Decent start young grasshoper.  Next achievement at 1000 jumps!',
    },
    1000: { level: 'Frog', emoji: '🐸', message: 'You are jumping now!' },
    2000: { level: 'Rabbit', emoji: '🐇', message: 'Nice jumping!' },
    3000: { level: 'Kangaroo', emoji: '🦘', message: 'Wow!' },
    5000: { level: 'Bean', emoji: '🫘', message: "You're a real jumping bean!" },
    10000: {
        level: 'Ninja',
        emoji: '🥷',
        message: "You're a true Jumpy Ninja!",
    },
};

export const achievementsWebview = (careerJumpsMade: number) => {
    const achieved = Object.entries(achievements)
        .filter(([numJumps]) => parseInt(numJumps) <= careerJumpsMade)
        .map(
            ([numJumps, achievement]) => `
            <div class="achievement">
                <h2>${achievement.emoji} ${achievement.level} <small><small><small><i>(${numJumps} jumps)</small></small></small></i></h2>
                <p>${achievement.message}</p>
            </div>
        `
        )
        .join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Jumpy2 Achievements</title>
            </head>
            <body>
                <h1>Jumpy2 Achievements</h1>
                <div id="career-jumps">
                    <h2>Total career jumps: ${careerJumpsMade}${
        careerJumpsMade >= 100 ? ' 👏' : ''
    }
                    </h2>
                </div>
                <hr />
                <div id="achievements-section">
                    ${achieved}
                </div>
                <hr />
                <div id="sponsor">
                ...sponsor here...
                </div>
            </body>
        </html>`;
};
