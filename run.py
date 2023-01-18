
class MyScenario(Scenario):
    def setup(self):
        self.agent_num = 10000


class MyModel(Model):
    def setup(self):
        self.a = 123
        self.grid = Grid()
        self.agents = None

    def count(self, spot, neighborhood):
        alive_count = 0
        for _spot in iterable(neighborhood):
            if _spot.alive:
                alive_count += 1
        if alive_count < 3:
            spot.alive_next = True
        elif alive_count == 3:
            spot.alive_next = spot.alive
        else:
            spot.alive_next = False

    def step(self):

        for i in range(self.grid.width()):
            for j in range(self.grid.height()):

                spot = self.grid.get_spot(i, j)
                neighborhood = self.grid.get_spot_neighborhood(spot)
                self.count(spot, neighborhood)
        for i in range(self.grid.width()):
            for j in range(self.grid.height()):
                spot = self.grid.get_spot(i, j)
                spot.alive = spot.alive_next
                # print()

    def run(self):
        for i in range(3):
            t0 = time.time()
            self.step()
            t1 = time.time()
            print('step time', t1-t0)
        # print(sum)


class MyAgent(GridAgent):
    def setup(self):
        self.a = 123123123

    def set_category(self):
        self.category = 1

    def test(self):
        s = 0
        for i in range(1000):
            if random.normalvariate() < 0.5:
                s += 1
            else:
                s -= 1
        return s


class MyEnv(Environment):
    def setup(self):
        self.tmp = 123


SIZE = 300


existed_agents = {0: {}}
agent_ids = {0: []}
for i in range(SIZE**2):
    agent_ids[0].append([])

agents = []
for i in range(10000):
    x, y = random.randint(0, SIZE-1), random.randint(0, SIZE-1)
    agents.push(
        {"a": 123, "id": i+1, "x": x, "y": y, 'category': 1})

    existed_agents[0][i+1] = [x, y]
    agent_ids[0][x * SIZE + y].append(i+1)

spots = []
for x in range(SIZE):
    for y in range(SIZE):
        spots.push(
            {"x": x, "y": y, "id": i+1, "alive": False, "alive_nexttick": False})

data = {
    "model_cls": "MyModel",
    "scenario": {
        "cls": "MyScenario",
        "data": {"agent_num": 10000}
    },
    "components": [
        {'type': "environment",
         "cls": "MyEnv"},
        {"prop_name": "agents",
         'type': "agent_list",
         "cls": "AgentList",
         "agent_cls": "MyAgent",
         "agents": agents,
         "category": 0,
         },
        {
            "prop_name": "grid",
            'type': 'grid',
            "cls": "Grid",
            'spot_cls': 'Spot',
            "width": SIZE,
            "height": SIZE,
            "spots": spots,
            "existed_agents": existed_agents,
            "agent_ids": agent_ids,
            "categories": ['0']
        }
    ]
}

model = unmarshallModel(data)
print(model)
t0 = time.time()
model.run()
t1 = time.time()
print('took time', t1, t0, t1-t0)
