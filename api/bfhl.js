const isValidEdge = (edge) => {
    if (typeof edge !== "string") return false;
    const trimmed = edge.trim();
    const regex = /^[A-Z]->[A-Z]$/;
    if (!regex.test(trimmed)) return false;
    const [p, c] = trimmed.split("->");
    if (p === c) return false;
    return true;
};

export default function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid input format" });
    }

    const invalid_entries = [];
    const duplicate_edges = [];
    const seen = new Set();
    const validEdges = [];

    for (let edge of data) {
        const e = edge.trim();

        if (!isValidEdge(e)) {
            invalid_entries.push(edge);
            continue;
        }

        if (seen.has(e)) {
            if (!duplicate_edges.includes(e)) duplicate_edges.push(e);
            continue;
        }

        seen.add(e);
        validEdges.push(e);
    }

    const graph = {};
    const children = new Set();
    const nodes = new Set();
    const parentMap = {};

    for (let edge of validEdges) {
        const [p, c] = edge.split("->");

        if (parentMap[c]) continue;

        parentMap[c] = p;

        if (!graph[p]) graph[p] = [];
        graph[p].push(c);

        children.add(c);
        nodes.add(p);
        nodes.add(c);
    }

    let roots = [];
    for (let n of nodes) {
        if (!children.has(n)) roots.push(n);
    }

    const build = (node, visited, stack) => {
        if (stack.has(node)) return { hasCycle: true };
        if (visited.has(node)) return { tree: {}, depth: 1 };

        visited.add(node);
        stack.add(node);

        let depth = 1;
        const tree = {};

        if (graph[node]) {
            for (let child of graph[node]) {
                const r = build(child, visited, stack);
                if (r.hasCycle) return { hasCycle: true };

                tree[child] = r.tree;
                depth = Math.max(depth, r.depth + 1);
            }
        }

        stack.delete(node);
        return { tree, depth };
    };

    const hierarchies = [];
    const processed = new Set();
    let maxDepth = 0;
    let largestRoot = "";
    let cycles = 0;

    for (let root of roots) {
        const visited = new Set();
        const stack = new Set();
        const r = build(root, visited, stack);

        visited.forEach(x => processed.add(x));

        if (r.hasCycle) {
            hierarchies.push({ root, tree: {}, has_cycle: true });
            cycles++;
            continue;
        }

        hierarchies.push({
            root,
            tree: { [root]: r.tree },
            depth: r.depth
        });

        if (r.depth > maxDepth || (r.depth === maxDepth && root < largestRoot)) {
            maxDepth = r.depth;
            largestRoot = root;
        }
    }

    for (let node of nodes) {
        if (processed.has(node)) continue;

        const visited = new Set();
        const stack = new Set();
        const r = build(node, visited, stack);

        if (r.hasCycle) {
            hierarchies.push({ root: node, tree: {}, has_cycle: true });
            cycles++;
        }
    }

    return res.status(200).json({
        user_id: "manaspatil_02092005",
        email_id: "mp4791@srmist.edu.in",
        college_roll_number: "RA2311003011682",
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: hierarchies.length - cycles,
            total_cycles: cycles,
            largest_tree_root: largestRoot
        }
    });
}