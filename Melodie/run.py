"""
This file stores the run function for model running, storing global variables and other services.
"""
from typing import ClassVar, TYPE_CHECKING, Optional
import logging

from .agent import Agent
from .agent_manager import AgentManager
from .analyzer import Analyzer
from .table_generator import TableGenerator

logger = logging.getLogger(__name__)
if TYPE_CHECKING:
    from .environment import Environment
    from .model import Model
    from .scenariomanager import ScenarioManager, Scenario
    from .datacollector import DataCollector
    from .config import Config
else:
    from .model import Model
    from .scenariomanager import ScenarioManager
    from .config import Config
    from .db import create_db_conn

_model: Optional['Model'] = None
_config: Optional['Config'] = None


def get_environment() -> 'Environment':
    """
    get environment from the global variable
    :return:
    """
    global _model
    assert _model is not None
    return _model.environment


def get_agent_manager() -> 'AgentManager':
    global _model
    assert _model is not None
    return _model.agent_manager


def current_scenario() -> 'Scenario':
    """
    Get current scenario.
    :return:
    """
    assert _model is not None
    return _model.scenario


def get_data_collector() -> 'DataCollector':
    assert _model is not None
    return _model.data_collector


def get_config() -> 'Config':
    assert _config is not None
    return _config


def run(
        agent_class: ClassVar['Agent'],
        environment_class: ClassVar['Environment'],
        config: 'Config' = None,
        data_collector_class: ClassVar['DataCollector'] = None,
        model_class: ClassVar['Model'] = None,
        scenario_manager_class: ClassVar['ScenarioManager'] = None,
        table_generator_class: ClassVar['TableGenerator'] = None,
        analyzer_class: ClassVar['Analyzer'] = None
):
    """
    Main Model for running model!
    If
    """
    global _model, _config
    if config is None:
        config = Config('Untitled')
        _config = config
    else:
        _config = config
        create_db_conn().reset()



    if model_class is None:
        model_class = Model

    if scenario_manager_class is None:
        scenario_manager = None
    else:
        scenario_manager: 'ScenarioManager' = scenario_manager_class()

    if scenario_manager is None:
        _model = model_class(config, environment_class, data_collector_class, table_generator_class)
        _model._setup()
        _model.run()
    else:
        for scenario in scenario_manager._scenarios:
            _model = model_class(config, agent_class,
                                 environment_class,
                                 data_collector_class,
                                 table_generator_class,
                                 scenario)
            _model._setup()
            _model.run()
            if analyzer_class is not None:
                analyzer_class().run()
