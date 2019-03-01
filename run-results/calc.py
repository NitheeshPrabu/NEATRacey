import os
import csv

metrics = ['euclidean', 'manhatten']
levels = [1, 2, 3, 4, 5]
best_sizes = [1, 5, 25, 50]

data = {0: ['converges', 'firstSteps', 'goalCount',
            'finalGen', 'finalSteps', 'finalGoalCount']}
results = {0: ['average_converges', 'average_first_step', 'average_goal_count', 'average_final_steps',
               'average_final_goal_count', 'null_percent', 'percent_increase', 'best_size', 'level', 'metric']}

for metric in metrics:
    data[metric] = {}
    results[metric] = {}
    print("Starting for metric " + str(metric) + "...\n")
    for level in levels:
        data[metric][level] = {}
        results[metric][level] = {}
        print("Starting for level " + str(level) + "...\n")
        for best_size in best_sizes:
            data[metric][level][best_size] = []
            results[metric][level][best_size] = []
            with open(os.path.dirname(os.path.abspath(__file__))+'/'+str(metric)+'/level'+str(level)+'-'+str(best_size)+'.csv', 'r') as csv_file:
                csv_reader = csv.reader(csv_file, delimiter=',')
                count = 0
                for row in csv_reader:
                    if count != 0:
                        row = [int(val) if val else -1 for val in row]
                        data[metric][level][best_size].append(row)
                    count += 1
                data[metric][level][best_size] = data[metric][level][best_size][1:]

                # find percent null, average, percent improvement in steps, percent improvement in goal count
                total_count = len(data[metric][level][best_size])
                total_null_count = 0
                running_sums = [0, 0, 0, 0, 0, 0]
                for row in data[metric][level][best_size]:
                    if row[0] == -1:
                        total_null_count += 1
                        continue
                    else:
                        for i in range(0, 6):
                            running_sums[i] += row[i]
                averages = [val/(total_count-total_null_count) for val in running_sums]
                # print(averages)
                averages = averages[0:3] + averages[4:]
                # print(averages)
                null_percent = round(
                    float(total_null_count * 100.0 / total_count), 2)
                percent_increase_steps = round(
                    float((averages[1]-averages[3]) * 100.0 / averages[1]), 2)
                percent_increase_goal_count = round(
                    float((averages[4]-averages[2]) * 100.0 / averages[2]), 2)
                percent_increase = round(float(
                    percent_increase_steps * percent_increase_goal_count * 10000.0 / (500*120)), 2)
                results[metric][level][best_size] = averages + \
                    [null_percent, percent_increase, best_size, level, metric]
            csv_file.close()
            print("Best Size " + str(best_size) + " done.")
        print("Level " + str(level) + " done.\n")
    print("Metric " + str(metric) + " done.\n")

with open(os.path.dirname(os.path.abspath(__file__))+'/results.csv', 'w') as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(results[0])
    for metric in metrics:
        for level in levels:
            for best_size in best_sizes:
                writer.writerow(results[metric][level][best_size])
csv_file.close()

print("File write complete.")
