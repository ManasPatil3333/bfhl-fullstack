const API_URL = "https://bfhl-fullstack-omega.vercel.app/api/bfhl";

async function submitData() {

    const input = document.getElementById("inputData").value;

    let data;

    try {
        data = JSON.parse(input);
    } catch {
        alert("Invalid JSON format");
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data })
        });

        const result = await res.json();
        displayResult(result);

    } catch (err) {
        alert("API Error");
    }
}

function displayResult(result) {

    const output = document.getElementById("output");
    output.innerHTML = "";

    // Hierarchies
    result.hierarchies.forEach(h => {
        const div = document.createElement("div");
        div.className = "card";

        if (h.has_cycle) {
            div.innerHTML = `<b style="color:red;">Cycle detected at root: ${h.root}</b>`;
        } else {
            div.innerHTML = `
                <h3>Root: ${h.root}</h3>
                <p><b>Depth:</b> ${h.depth}</p>
                <pre>${JSON.stringify(h.tree, null, 2)}</pre>
            `;
        }

        output.appendChild(div);
    });

    // Summary
    const summary = document.createElement("div");
    summary.className = "card summary";
    summary.innerHTML = `
        <h3>Summary</h3>
        <p>Total Trees: ${result.summary.total_trees}</p>
        <p>Total Cycles: ${result.summary.total_cycles}</p>
        <p>Largest Tree Root: ${result.summary.largest_tree_root}</p>
    `;
    output.appendChild(summary);

    // Invalid
    if (result.invalid_entries.length) {
        const invalid = document.createElement("div");
        invalid.className = "card error";
        invalid.innerHTML = `<b>Invalid Entries:</b> ${result.invalid_entries.join(", ")}`;
        output.appendChild(invalid);
    }

    // Duplicates
    if (result.duplicate_edges.length) {
        const dup = document.createElement("div");
        dup.className = "card error";
        dup.innerHTML = `<b>Duplicate Edges:</b> ${result.duplicate_edges.join(", ")}`;
        output.appendChild(dup);
    }
}