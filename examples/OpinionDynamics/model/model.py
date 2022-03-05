
from typing import TYPE_CHECKING
from Melodie import Model
from .agent import GiniAgent
from .data_collector import GiniDataCollector
from .environment import GiniEnvironment

if TYPE_CHECKING:
    from .scenario import GiniScenario

class GiniModel(Model):
    scenario: 'GiniScenario'

    def setup(self):
        self.agent_list = self.create_agent_container(GiniAgent, self.scenario.agent_num,
                                                      self.scenario.get_registered_dataframe('agent_params'))

        with self.define_basic_components():
            self.environment = GiniEnvironment()
            self.data_collector = GiniDataCollector()

    def run(self):
        for t in range(0, self.scenario.periods):
            self.environment.go_money_produce(self.agent_list)
            self.environment.go_money_transfer(self.agent_list)
            self.environment.calc_wealth_and_gini(self.agent_list)
            self.data_collector.collect(t)
        self.data_collector.save()
