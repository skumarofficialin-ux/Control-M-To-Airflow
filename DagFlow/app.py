from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        with open(filepath, 'r') as f:
            data = json.load(f)
        jobs = parse_jobs(data)
        return jsonify({'jobs': jobs})

def parse_jobs(raw_data):
    jobs = []
    for key in raw_data:
        if key != 'Defaults' and 'jobs' in raw_data[key]:
            for job in raw_data[key]['jobs']:
                jobs.append({
                    'name': job.get('Name', ''),
                    'schedule': job.get('Schedule', 'N/A'),
                    'events': {
                        'add': (job.get('Events', {}).get('Out', []) + 
                               job.get('Conditions', {}).get('Out', [])),
                        'delete': [],  # Assuming no delete
                        'waitfor': (job.get('Events', {}).get('In', []) + 
                                   job.get('Conditions', {}).get('In', []))
                    },
                    'dependencies': job.get('DependsOn', []),
                    'type': job.get('Type', ''),
                    'command': job.get('Command', ''),
                    'description': job.get('Description', '')
                })
    return jobs

@app.route('/job/<job_name>', methods=['GET'])
def get_job_details(job_name):
    # In a real app, you'd load from session or database, but for simplicity, assume uploaded
    # For now, return placeholder
    return jsonify({'error': 'Job details not available'})

if __name__ == '__main__':
    app.run(debug=True)