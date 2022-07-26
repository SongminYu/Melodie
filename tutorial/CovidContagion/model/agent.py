from typing import TYPE_CHECKING
from Melodie import GridAgent
import random

if TYPE_CHECKING:
    from Melodie import AgentList
    from .scenario import CovidScenario
    from .grid import CovidGrid


class CovidAgent(GridAgent):
    scenario: 'CovidScenario'

    def set_category(self):  # 要求用户如果继承GridAgent则必须定义category，且用整数
        ...

    def setup(self):
        self.x = 0
        self.y = 0
        self.age_group = 0
        self.health_state = 0

    def move(self):
        # check the stay_prob of spot, if not stay, then move
        move_radius = self.scenario.get_move_radius(self.age_group)
        self.rand_move(move_radius, move_radius)  # 可以试试走得更远一点？

    def get_grid_neighbors(self, grid: 'CovidGrid'):
        neighbors: list = grid.get_neighbors(self.x, self.y, radius=1)
        return neighbors

    def infect_from_neighbors(self, infection_prob: float, grid: 'CovidGrid', agents: 'AgentList[CovidAgent]') -> int:
        neighbors = self.get_grid_neighbors(grid)
        for neighbor in neighbors:  # neighbors不是CovidAgent的list嘛？
            x, y = neighbor[0], neighbor[1]
            agent_ids = grid.get_agent_ids(x, y)  # 因为可能站着多个agent？或者，应该是单数 - get_agent_id？
            for agent_id, agent_category in agent_ids:  # 这里不清楚，为什么是多个agent？
                # if agent_id == self.id:  # 为什么neighbors里会有自己？前面get_neighbors()已经排除了吧？
                #     continue
                a: CovidAgent = agents.get_agent(agent_id)
                if a.health_state == 1 and random.uniform(0, 1) < infection_prob:
                    self.health_state = 1
                    break

    def health_state_transition(self):
        if self.health_state == 1:
            prob_s1_s1, prob_s1_s2, prob_s1_s3 = self.scenario.get_state_transition_prob(self.age_group)
            rand = random.uniform(0, 1)
            if rand <= prob_s1_s1:
                pass
            elif prob_s1_s1 < rand <= prob_s1_s1 + prob_s1_s2:
                self.health_state = 2
            else:
                self.health_state = 3
        else:
            pass

    def get_network_neighbors(self):
        pass

    def take_vaccination(self):
        # 受一个中央信号影响，同时受网络上的邻居影响，决定是否接种疫苗
        # 只有health_state = 0的人考虑打疫苗，然后health_state = 4
        pass
