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
    const curLevel = parseInt(
        Object.keys(achievements)
            .reverse()
            .find(
                (numJumps: string) => parseInt(numJumps) <= careerJumpsMade
            ) || Object.keys(achievements)[0]
    );
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
                <div id="achievement-level">
                <h2>${achievements[curLevel].emoji} ${
        achievements[curLevel].level
    } </h2>
                <p>${achievements[curLevel].message}</p>
                </div>
                <div id="career-jumps">
                    Total career jumps: ${careerJumpsMade}${
        careerJumpsMade >= 100 ? ' 👏' : ''
    }
                </div>
                <div id="sponsor">
                ...sponsor here...
                </div>
            </body>
        </html>`;
};
