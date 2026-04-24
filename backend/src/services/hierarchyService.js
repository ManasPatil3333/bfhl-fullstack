const { isValidEdge, normalizeEdge } = require('../utils/validator');

exports.buildHierarchy = (data) => {

    const invalid_entries = [];
    const duplicate_edges = [];
    const seen = new Set();
    const validEdges = [];

    // STEP 1: Validate + Deduplicate
    for (let edge of data) {

        const normalized = normalizeEdge(edge);

        if (!isValidEdge(normalized)) {
            invalid_entries.push(edge);
            continue;
        }

        if (seen.has(normalized)) {
            if (!duplicate_edges.includes(normalized)) {
                duplicate_edges.push(normalized);
            }
            continue;
        }

        seen.add(normalized);
        validEdges.push(normalized);
    }

    // STEP 2: Build Graph with multi-parent handling
    const graph = {};
    const childrenSet = new Set();
    const allNodes = new Set();
    const childParentMap = {}; // child -> parent

    for (let edge of validEdges) {
        const [parent, child] = edge.split("->");

        // Multi-parent check (only first parent allowed)
        if (childParentMap[child]) {
            continue;
        }

        childParentMap[child] = parent;

        if (!graph[parent]) {
            graph[parent] = [];
        }

        graph[parent].push(child);

        childrenSet.add(child);
        allNodes.add(parent);
        allNodes.add(child);
    }

    // STEP 3: Find Roots
    let roots = [];

    for (let node of allNodes) {
        if (!childrenSet.has(node)) {
            roots.push(node);
        }
    }

    // STEP 4: DFS with cycle detection
    const buildTree = (node, visited, stack) => {

        if (stack.has(node)) {
            return { hasCycle: true };
        }

        if (visited.has(node)) {
            return { tree: {}, depth: 1 };
        }

        visited.add(node);
        stack.add(node);

        let maxDepth = 1;
        const subtree = {};

        if (graph[node]) {
            for (let child of graph[node]) {

                const result = buildTree(child, visited, stack);

                if (result.hasCycle) {
                    return { hasCycle: true };
                }

                subtree[child] = result.tree;
                maxDepth = Math.max(maxDepth, result.depth + 1);
            }
        }

        stack.delete(node);

        return { tree: subtree, depth: maxDepth };
    };

    // STEP 5: Build Hierarchies (INCLUDING DISCONNECTED COMPONENTS)
    const hierarchies = [];
    const processed = new Set();

    let largestDepth = 0;
    let largestRoot = "";
    let totalCycles = 0;

    // First process normal roots
    for (let root of roots) {

        const visited = new Set();
        const stack = new Set();

        const result = buildTree(root, visited, stack);

        visited.forEach(n => processed.add(n));

        if (result.hasCycle) {
            hierarchies.push({
                root,
                tree: {},
                has_cycle: true
            });
            totalCycles++;
            continue;
        }

        hierarchies.push({
            root,
            tree: {
                [root]: result.tree
            },
            depth: result.depth
        });

        if (
            result.depth > largestDepth ||
            (result.depth === largestDepth && root < largestRoot)
        ) {
            largestDepth = result.depth;
            largestRoot = root;
        }
    }

    // 🔥 Handle remaining nodes (cycle-only components)
    for (let node of allNodes) {

        if (processed.has(node)) continue;

        const visited = new Set();
        const stack = new Set();

        const result = buildTree(node, visited, stack);

        visited.forEach(n => processed.add(n));

        if (result.hasCycle) {
            hierarchies.push({
                root: node,
                tree: {},
                has_cycle: true
            });
            totalCycles++;
        }
    }

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees: hierarchies.length - totalCycles,
            total_cycles: totalCycles,
            largest_tree_root: largestRoot
        }
    };
};