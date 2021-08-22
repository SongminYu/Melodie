from typing import Union, Dict, TYPE_CHECKING

import pandas as pd

if TYPE_CHECKING:
    from Melodie.ScenarioManager import Scenario


class DB:

    def read_DataFrame(self, table_name, conn, **kwargs):
        if len(kwargs) > 0:
            condition_temp = " where "
            for key, value in kwargs.items():
                condition_temp = condition_temp + key + " == '" + str(value) + "' and "
            condition = condition_temp[0:-5]
            DataFrame = pd.read_sql('select * from ' + table_name + condition, con=conn)
        else:
            DataFrame = pd.read_sql('select * from ' + table_name, con=conn)
        return DataFrame

    def write_DataFrame(self, table, table_name, column_names, conn, **kwargs):
        table_DataFrame = pd.DataFrame(table, columns=column_names)
        if "dtype" in kwargs:
            table_DataFrame.to_sql(table_name, conn, index=False,
                                   if_exists='replace', chunksize=1000, dtype=kwargs["dtype"])
        else:
            table_DataFrame.to_sql(table_name, conn, index=False, if_exists='replace', chunksize=1000)
        return None

    def createScenario(self, tableName: str, conn, scenario: 'Scenario', **kwargs):
        settingsDataFrame = pd.DataFrame([scenario.toDict()])
        settingsDataFrame.to_sql(tableName, conn, index=False, if_exists='replace', chunksize=1000,
                                 dtype=kwargs["dtype"])
