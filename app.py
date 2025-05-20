# app.py (Flask Backend)

from flask import Flask, request, jsonify, render_template # Make sure render_template is imported
import numpy as np

# Initialize Flask app.
# By default, Flask looks for a 'templates' folder in the same directory as app.py
# and a 'static' folder for static files.
app = Flask(__name__)

# --- Sudoku Solver Logic (Backtracking) ---
def is_valid(grid, row, col, num):
    """
    Checks if it's valid to place 'num' at grid[row][col].
    This function verifies that 'num' is not already present in the
    current row, current column, or the 3x3 subgrid.
    """
    # Check row: Iterate through all columns in the current row
    for x in range(9):
        if grid[row][x] == num:
            return False # Number found in the same row

    # Check column: Iterate through all rows in the current column
    for x in range(9):
        if grid[x][col] == num:
            return False # Number found in the same column

    # Check 3x3 subgrid:
    # Determine the top-left corner of the 3x3 subgrid
    start_row = row - row % 3
    start_col = col - col % 3
    # Iterate through the 3x3 subgrid
    for i in range(3):
        for j in range(3):
            if grid[i + start_row][j + start_col] == num:
                return False # Number found in the subgrid
    return True # Number is valid to place

def solve_sudoku_util(grid):
    """
    Recursive utility function to solve Sudoku using backtracking.
    It iterates through each cell. If a cell is empty (0), it tries
    placing numbers from 1 to 9. If a number is valid, it places it
    and recursively calls itself. If the recursion leads to a solution,
    it returns True. If not, it backtracks (resets the cell to 0)
    and tries the next number.
    """
    for i in range(9): # Iterate through rows
        for j in range(9): # Iterate through columns
            if grid[i][j] == 0:  # Find an empty cell (represented by 0)
                for num in range(1, 10):  # Try numbers 1 through 9
                    if is_valid(grid, i, j, num): # Check if the number is valid in this position
                        grid[i][j] = num # Place the number

                        if solve_sudoku_util(grid): # Recursively try to solve the rest of the puzzle
                            return True  # Solution found for the rest of the puzzle

                        grid[i][j] = 0  # Backtrack: reset the cell if the placement didn't lead to a solution
                return False  # No valid number (1-9) found for this empty cell, trigger backtracking
    return True # All cells are filled, puzzle solved

def solve_puzzle(puzzle_data):
    """
    Main function to solve the Sudoku puzzle.
    Args:
        puzzle_data: A flat list of 81 integers representing the Sudoku board.
                     0 indicates an empty cell.
    Returns:
        The solved grid as a list of lists if a solution is found,
        otherwise None.
    """
    if not isinstance(puzzle_data, list) or len(puzzle_data) != 81:
        # Basic validation for the input data structure
        return None

    # Convert the flat list into a 9x9 grid (list of lists)
    try:
        grid = np.array(puzzle_data, dtype=int).reshape((9, 9)).tolist()
    except ValueError:
        return None


    if solve_sudoku_util(grid): # Call the recursive solver
        return grid # Return the solved grid
    else:
        return None # Puzzle is unsolvable

# --- Flask Routes ---
@app.route('/')
def index():
    """Serves the main HTML page (index.html from the 'templates' folder)."""
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    """
    API endpoint to receive a Sudoku puzzle, solve it, and return the solution.
    Expects a JSON POST request with a 'puzzle' key containing a flat list of 81 numbers.
    """
    try:
        data = request.get_json() # Get JSON data from the request

        if 'puzzle' not in data or not isinstance(data['puzzle'], list):
            return jsonify({'error': 'Invalid input format. "puzzle" key with a list of 81 numbers is required.'}), 400

        puzzle_flat_list = data['puzzle']

        if len(puzzle_flat_list) != 81 or \
           not all(isinstance(n, int) and 0 <= n <= 9 for n in puzzle_flat_list):
            return jsonify({'error': 'Puzzle must be a list of 81 integers, where each integer is between 0 and 9.'}), 400

        solution = solve_puzzle(puzzle_flat_list)

        if solution:
            solved_flat_list = [num for row in solution for num in row]
            return jsonify({'solution': solved_flat_list, 'status': 'solved'})
        else:
            return jsonify({'error': 'Puzzle is unsolvable or invalid.', 'status': 'unsolvable'}), 400
    except Exception as e:
        app.logger.error(f"Error during solving: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred on the server. Please try again.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
