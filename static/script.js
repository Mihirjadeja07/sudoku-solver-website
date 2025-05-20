// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Log 1

    const gridElement = document.getElementById('sudoku-grid');
    const solveButton = document.getElementById('solve-button');
    const clearButton = document.getElementById('clear-button');
    const easyPuzzleButton = document.getElementById('easy-puzzle-button');
    const messageArea = document.getElementById('message-area');
    const cells = []; // To store input elements

    if (!gridElement) {
        console.error('CRITICAL: The element with ID "sudoku-grid" was not found in the HTML.');
        return; // Stop execution if the main grid container is missing
    }
    console.log('Sudoku grid container element found:', gridElement); // Log 2

    // --- Grid Generation ---
    function createGrid() {
        console.log('createGrid function called'); // Log 3
        gridElement.innerHTML = ''; // Clear existing grid content
        cells.length = 0; // Clear the cells array
        console.log('Grid cleared, cells array emptied.'); // Log 4

        // Loop 81 times to create each cell
        for (let i = 0; i < 81; i++) {
            const rowIndex = Math.floor(i / 9); // Calculate row index (0-8)
            const colIndex = i % 9;             // Calculate column index (0-8)

            if (i === 0) console.log('Starting to create cells...'); // Log 5 (once)

            const cellDiv = document.createElement('div');
            // Removed aspect-square for testing, adding explicit min-width/height and bright background
            cellDiv.className = 'sudoku-cell flex items-center justify-center border border-gray-300'; // Base classes
            // **** START DEBUG STYLE ****
            cellDiv.style.minWidth = '30px';    // Explicit minimum width
            cellDiv.style.minHeight = '30px';   // Explicit minimum height
            cellDiv.style.backgroundColor = 'lime'; // Bright background for visibility
            // **** END DEBUG STYLE ****


            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.row = rowIndex;
            input.dataset.col = colIndex;
            input.className = 'w-full h-full text-center bg-transparent focus:bg-sky-100 outline-none text-inherit font-inherit';
            // **** START DEBUG STYLE FOR INPUT ****
            input.style.color = 'black'; // Ensure text is visible
            // **** END DEBUG STYLE FOR INPUT ****


            input.addEventListener('input', (e) => {
                let value = e.target.value;
                if (!value.match(/^[1-9]$/) && value !== '') {
                    e.target.value = '';
                }
                e.target.parentElement.classList.remove('error-cell', 'bg-red-100', 'text-red-500');
                e.target.parentElement.style.backgroundColor = 'lime'; // Reset to debug color if error removed
                messageArea.textContent = '';
                messageArea.className = 'text-center text-sm font-medium p-3 rounded-md mt-4';
            });

            input.addEventListener('keydown', handleArrowNavigation);

            cellDiv.appendChild(input);
            gridElement.appendChild(cellDiv); // Directly append cell to the grid container
            cells.push(input);

            if (i === 0) console.log('First cellDiv appended:', cellDiv); // Log 6 (once)
            if (i === 80) console.log('Last cellDiv appended. Total cells created:', cells.length); // Log 7 (once)
        }
        console.log('Finished creating cells. Now applying thick grid lines.'); // Log 8
        applyThickGridLines();
    }

    function applyThickGridLines() {
        console.log('applyThickGridLines function called'); // Log 9
        const allCellDivs = gridElement.querySelectorAll('.sudoku-cell');
        if (!allCellDivs || allCellDivs.length !== 81) {
            console.error('Could not find all 81 .sudoku-cell elements for applying thick lines. Found:', allCellDivs.length);
            return;
        }

        allCellDivs.forEach((cellDiv, index) => {
            const r = Math.floor(index / 9);
            const c = index % 9;

            // Reset any specific border thickness classes first
            cellDiv.classList.remove(
                'border-r-gray-300', 'border-b-gray-300',
                'border-r-2', 'border-r-gray-700',
                'border-b-2', 'border-b-gray-700'
            );
            cellDiv.classList.add('border', 'border-gray-300');


            if (c === 2 || c === 5) {
                cellDiv.classList.remove('border-r-gray-300');
                cellDiv.classList.add('border-r-2', 'border-r-gray-700');
            }

            if (r === 2 || r === 5) {
                cellDiv.classList.remove('border-b-gray-300');
                cellDiv.classList.add('border-b-2', 'border-b-gray-700');
            }
        });
        console.log('Finished applying thick grid lines.'); // Log 10
    }


    function handleArrowNavigation(e) {
        const currentInput = e.target;
        let currentRow = parseInt(currentInput.dataset.row);
        let currentCol = parseInt(currentInput.dataset.col);
        let newRow = currentRow;
        let newCol = currentCol;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (currentRow > 0) newRow = currentRow - 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (currentRow < 8) newRow = currentRow + 1;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentCol > 0) newCol = currentCol - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentCol < 8) newCol = currentCol + 1;
                break;
            default:
                return;
        }
        const targetIndex = newRow * 9 + newCol;
        if (cells[targetIndex]) {
            cells[targetIndex].focus();
        }
    }

    function getPuzzle() {
        const puzzle = [];
        let isValidInput = true;
        cells.forEach(input => {
            const value = input.value;
            if (value === '' || (value >= '1' && value <= '9')) {
                puzzle.push(value === '' ? 0 : parseInt(value));
                input.parentElement.classList.remove('error-cell', 'bg-red-100', 'text-red-500');
                input.parentElement.style.backgroundColor = 'lime'; // Reset to debug color
            } else {
                puzzle.push(0);
                input.parentElement.classList.add('error-cell'); // Keep .error-cell for logic
                input.parentElement.style.backgroundColor = 'red'; // Make error cells visually distinct
                isValidInput = false;
            }
        });
        if (!isValidInput) {
            showMessage('Invalid input in some cells. Only numbers 1-9 are allowed.', 'error');
            return null;
        }
        return puzzle;
    }

    function displaySolution(solutionArray) {
        if (!solutionArray || solutionArray.length !== 81) {
            showMessage('Received invalid solution format from server.', 'error');
            return;
        }
        solutionArray.forEach((value, index) => {
            if (cells[index]) {
                const originalValueIsEmpty = cells[index].value === '' || cells[index].value === '0';
                cells[index].value = value === 0 ? '' : value.toString();
                // Clear specific debug styles and normal styles
                cells[index].parentElement.style.backgroundColor = ''; // Remove inline debug background
                cells[index].parentElement.classList.remove('error-cell', 'bg-red-100', 'text-red-500', 'solved', 'text-green-600');
                cells[index].classList.remove('font-bold');


                if (value !== 0 && originalValueIsEmpty) {
                    cells[index].parentElement.classList.add('solved', 'text-green-600');
                    cells[index].classList.add('font-bold');
                    cells[index].parentElement.style.backgroundColor = 'lightgreen'; // Visual cue for solved cells
                } else if (value !==0 && !originalValueIsEmpty) {
                    cells[index].parentElement.style.backgroundColor = 'lightgray'; // Pre-filled cells
                } else {
                     cells[index].parentElement.style.backgroundColor = ''; // Empty cells in solution
                }
                cells[index].readOnly = true;
            }
        });
    }

    function showMessage(message, type = 'info') {
        messageArea.textContent = message;
        messageArea.className = 'text-center text-sm font-medium p-3 rounded-md mt-4';
        if (type === 'success') {
            messageArea.classList.add('bg-green-100', 'text-green-700');
        } else if (type === 'error') {
            messageArea.classList.add('bg-red-100', 'text-red-700');
        } else {
            messageArea.classList.add('bg-blue-100', 'text-blue-700');
        }
    }

    solveButton.addEventListener('click', async () => {
        // Reset cell backgrounds before solving
        cells.forEach(cell_input => {
            cell_input.parentElement.style.backgroundColor = 'lime'; // Reset to debug color
             cell_input.parentElement.classList.remove('solved', 'text-green-600', 'error-cell', 'bg-red-100', 'text-red-500');
             cell_input.classList.remove('font-bold');
             cell_input.readOnly = false;
        });

        const puzzle = getPuzzle(); // This will apply red background to error cells
        if (!puzzle) return;


        showMessage('Solving...', 'info');
        solveButton.disabled = true;
        clearButton.disabled = true;
        easyPuzzleButton.disabled = true;

        try {
            const response = await fetch('/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puzzle: puzzle }),
            });
            const result = await response.json();
            if (response.ok && result.solution) {
                displaySolution(result.solution);
                showMessage('Sudoku Solved!', 'success');
            } else {
                // If unsolvable, keep the red error cells from getPuzzle()
                showMessage(result.error || 'Failed to solve. Puzzle might be invalid/unsolvable.', 'error');
            }
        } catch (error) {
            console.error('Error during fetch:', error);
            showMessage('An error occurred while connecting to the server.', 'error');
        } finally {
            solveButton.disabled = false;
            clearButton.disabled = false;
            easyPuzzleButton.disabled = false;
        }
    });

    clearButton.addEventListener('click', () => {
        cells.forEach(input => {
            input.value = '';
            input.readOnly = false;
            input.parentElement.style.backgroundColor = 'lime'; // Reset to debug color
            input.parentElement.classList.remove('solved', 'text-green-600', 'error-cell', 'bg-red-100', 'text-red-500', 'pre-filled', 'bg-gray-100', 'text-gray-600');
            input.classList.remove('font-bold');
        });
        showMessage('Grid cleared. Ready for a new puzzle!', 'info');
    });

    easyPuzzleButton.addEventListener('click', () => {
        const easyPuzzle = [
            5,3,0,0,7,0,0,0,0,
            6,0,0,1,9,5,0,0,0,
            0,9,8,0,0,0,0,6,0,
            8,0,0,0,6,0,0,0,3,
            4,0,0,8,0,3,0,0,1,
            7,0,0,0,2,0,0,0,6,
            0,6,0,0,0,0,2,8,0,
            0,0,0,4,1,9,0,0,5,
            0,0,0,0,8,0,0,7,9
        ];
        clearButton.click(); // This will set background to lime
        easyPuzzle.forEach((value, index) => {
            if (cells[index] && value !== 0) {
                cells[index].value = value.toString();
                cells[index].parentElement.style.backgroundColor = 'lightgray'; // Style for pre-filled cells
            }
        });
        showMessage('Easy puzzle loaded!', 'info');
    });

    document.getElementById('current-year').textContent = new Date().getFullYear();

    if (gridElement) {
        createGrid();
        console.log('Initial grid creation process finished.'); // Log 11
    } else {
        console.error('Cannot create grid because "sudoku-grid" element was not found earlier.'); // Log 12
    }
});
