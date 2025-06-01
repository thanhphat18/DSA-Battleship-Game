export class GridUtils {
    static adjacentCells(row, col, size) {
        const cells = [];
        if (row > 0) cells.push({ row: row - 1, col });//left
        if (row < size - 1) cells.push({ row: row + 1, col });//right
        if (col > 0) cells.push({ row, col: col - 1 });//up
        if (col < size - 1) cells.push({ row, col: col + 1 });//down
        return cells;
    }

    static getDirection(from, to) {
        if (from.row === to.row) return from.col < to.col ? "right" : "left";
        if (from.col === to.col) return from.row < to.row ? "down" : "up";
        return null;
    }

    static reverse(dir) {
        const map = { up: "down", down: "up", left: "right", right: "left" };
        return map[dir] || null;
    }

    static nextInDirection(row, col, dir) {
        switch (dir) {
            case "up": return { row: row - 1, col };
            case "down": return { row: row + 1, col };
            case "left": return { row, col: col - 1 };
            case "right": return { row, col: col + 1 };
            default: return null;
        }
    }
}