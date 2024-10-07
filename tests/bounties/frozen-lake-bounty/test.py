import gymnasium as gym
import onnxruntime as ort
import numpy as np
import sys

# Load the FrozenLake environment
env = gym.make("FrozenLake-v1")

# Load the ONNX model
model_path = sys.argv[1]  # Update this path
session = ort.InferenceSession(model_path)

# Get the input and output names of the model
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name

# Reset the environment
state, _ = env.reset()

steps = 0


# Main loop
for _ in range(100):  # You can adjust the number of steps
    # Convert the state to a numpy array and add a batch dimension
    state_array = np.array([state], dtype=np.float32)
    
    # Run the model to get the action
    outputs = session.run([output_name], {input_name: state_array})
    action = np.argmax(outputs[0][0])  # Assuming the output is a probability distribution
    
    # Take the action in the environment
    next_state, reward, terminated, truncated, _ = env.step(action)
    
    if reward == 1: 
        break
    
    steps -= 1

# Close the environment
env.close()


# Print number of steps it took to complete, but negated (fewer steps is better)
print(steps)

