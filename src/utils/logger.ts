import chalk from 'chalk';

export const logger = {
    info: (message: string) => {
        console.log(
            `[${chalk.gray(new Date().toLocaleTimeString())}] ${chalk.blue('[INFO]')} ${message}`,
        );
    },
    success: (message: string) => {
        console.log(
            `[${chalk.gray(new Date().toLocaleTimeString())}] ${chalk.green('[SUCCESS]')} ${message}`,
        );
    },
    error: (message: string) => {
        console.log(
            `[${chalk.gray(new Date().toLocaleTimeString())}] ${chalk.red('[ERROR]')} ${message}`,
        );
    },
    warn: (message: string) => {
        console.log(
            `[${chalk.gray(new Date().toLocaleTimeString())}] ${chalk.yellow('[WARN]')} ${message}`,
        );
    },
}