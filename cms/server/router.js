import Router from 'koa-router';
import path from 'path';
import fs from 'fs-extra';
import open from 'open';
import compile from '../../bin/compile.js';
import render from './middleware/render.js';

const DATABASE_JSON_PATH = path.resolve(__dirname, '..', '..', 'gen', 'database.json');
const DIST_INDEX_PATH = path.resolve(__dirname, '..', '..', 'dist', 'index.html');

export default new Router().get('/:issue/:key', blah).post('/cms-api/:issue/:key', updateDatabase);
/* .get('/cms-compile', compileTags)
    .get('/cms-visit', visitSite); */

function blah(ctx) {
    const database = getDatabase(ctx.params.issue);

    render(ctx, database);
}

function makeDatabase(dbPath) {
    writeFile(dbPath, JSON.stringify({ blah: { value: 'help' } }, null, 4));
}

function getDatabasePath(issue) {
    return path.resolve(__dirname, '..', '..', 'gen', `${issue}.json`);
}

function getDatabase(issue) {
    const dbPath = getDatabasePath(issue);

    try {
        return require(dbPath);
    } catch (err) {
        makeDatabase(dbPath);
        return getDatabase(issue);
    }
}

function updateDatabase(ctx) {
    if (!ctx.database) {
        ctx.database = getDatabase(ctx.params.issue);
    }

    const { body } = ctx.request;
    if (ctx.database[ctx.params.key]) {
        ctx.database[ctx.params.key].value = body.value;
    }

    writeFile(getDatabasePath(ctx.params.issue), JSON.stringify(ctx.database));

    ctx.status = 200;
    ctx.body = JSON.stringify(body);
}

function writeFile(filePath, fileContents) {
    fs.ensureFileSync(filePath);
    fs.writeFileSync(filePath, fileContents, 'utf-8');
}

/* function compileTags(ctx) {
    if (!ctx.database) {
        ctx.database = getDatabase();
    }

    writeFile(DATABASE_JSON_PATH, JSON.stringify(ctx.database));
    compile();
    getDatabase();
    ctx.status = 200;
    ctx.body = JSON.stringify(ctx.database);
}

async function visitSite() {
    await open(DIST_INDEX_PATH);
}
 */
