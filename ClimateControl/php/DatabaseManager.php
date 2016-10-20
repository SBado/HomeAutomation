<?php

define('DB_PATH', $_SERVER['DOCUMENT_ROOT'] . '/ClimateControl/database/database.sqlite');

class DatabaseManager
{
    private $db = null;
    private $errmsg = null;
    private $error = array('errnum' => null, 'errmsg' => null);
    
    //// [Singleton]
    //private static $instance = null;

    //public static function getInstance()
    //{
    //    error_log('INSTANCE:');
    //    error_log(print_r(self::$instance, true));
    //    if (!self::$instance)
    //    {
    //        error_log('NO ISTANCE FOUND!');
    //        self::$instance = new self;
    //        error_log(print_r(self::$instance, true));
    //        error_log('INSTANCE CREATED!');
    //        self::$instance->init();
    //    }
        
    //    return self::$instance;
    //}

    //private function __clone(){}
    //// [/Singleton]

    public function __construct() {        
        $this->db = new SQlite3(DB_PATH, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);                 
        $this->init();            
    }

    public function open() {
        try {            
            $this->db->open(DB_PATH, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);  
            $this->db->busyTimeout(10000);          
        }
        catch(Exception $e) {
            die("EXCEPTION: $e->getMessage()");
        }
    }

    public function close() {
        $this->db->close();
    }

    private function init() {

        $this->db->busyTimeout(10000);

        $sql =<<<EOF
      SELECT name FROM sqlite_master WHERE type='table'
EOF;

        $result = $this->db->query($sql) or die("ERROR " + $this->db->lastErrorCode() + ": " + $this->db->lastErrorMsg());
            
        $tables = array();
            
        while($row = $result->fetchArray(SQLITE3_ASSOC) ){
            array_push($tables, $row['name']);
        }

        if(count($tables) != 4) {
            if (!in_array('DailyTemps', $tables)) {
                $this->create_daily_temps_table();   
            }
            if (!in_array('ScheduledTemps', $tables)) {
                $this->create_scheduled_temps_table();
            }
            if (!in_array('Configs', $tables)) {
                $this->create_configs_table();
            }
            if (!in_array('Users', $tables)) {
                $this->create_users_table();
            }
        }

        $this->close();
    }

    private function format_day($day) {        
        setlocale(LC_TIME, array('en_US.UTF-8','en_US','english'));
        $timestamp = strtotime('next ' . $day);
        if ($timestamp != null)
        	return ucwords(strftime('%A', $timestamp));
        return null;
    }

    private function format_date($date) {
        $date = str_replace('T', ' ', $date);
        if (strrpos($date, '.') != FALSE)
            $date = substr($date, 0, strrpos($date, '.'));
        if (strrpos($date, '+') != FALSE)
            $date = substr($date, 0, strrpos($date, '+'));
        return $date;
    }

    private function format_dates($dates) {
        foreach ($dates as $index => $date) {
            $date = str_replace('T', ' ', $date);
            $date = substr($date, 0, strrpos($date, '.'));
            $dates[$index] = $date;
        }
        return $dates;
    }

    private function date_to_ISOString($date) {        
        $date = str_replace(' ', 'T', $date);
        $date = $date . '.000Z';
        return $date;
    }

    private function build_output_single_value($result, $column) {
        $row = $result->fetchArray(SQLITE3_ASSOC);
        if (!$row)
            return array('data' => null, 'error' => null);
        $value = $row[$column];
        if ($column == 'Date')
                $value = $this->date_to_ISOString($value);        
        return array('data' => $value, 'error' => null);
    }

    private function build_output_multiple_values($result, $column) {
        $values = array();
        $value = null;
        while($row = $result->fetchArray(SQLITE3_ASSOC) ){
            $value = $row[$column];
            if ($column == 'Date')
                $value = $this->date_to_ISOString($value);
            array_push($values, $value);
        }
        
        return array('data' => $values, 'error' => null);
    }

    private function build_output_multiple_rows($result) {
        $rows = array();
        while($row = $result->fetchArray(SQLITE3_ASSOC) ){
            array_push($rows, $row);
        }

        return array('data' => $rows, 'error' => null);
    }
    
    private function create_daily_temps_table() {
        setlocale(LC_TIME, array('en_US.UTF-8','en_US','english'));
        $timestamp = strtotime('next Monday');
        $days = array();
        for($i = 0; $i < 7; $i++) {
            $days[$i] = strftime('%A', $timestamp);
            $timestamp = strtotime('+1 day', $timestamp);
        }

        $temp = 2.0;

        $sql =<<<EOF
            CREATE TABLE IF NOT EXISTS DailyTemps(
            Day         TEXT    NOT NULL,
            Hour        TEXT     NOT NULL,
            Temperature        REAL    NOT NULL,
            PRIMARY KEY(Day, Hour))
EOF;

        //$this->db->exec($sql) or die("ERROR " + $this->db->lastErrorCode() + ": " + $this->db->lastErrorMsg()) ;

        try {
            $this->db->exec($sql);
        }
        catch (Exception $e) {
            error_log($e->getCode());
            error_log($e->getMessage());
        }
        
        foreach($days as $day) {
            for($hour = 0; $hour < 24; $hour++) {
                $this->create_daily_temp($day, $hour . ':00', $temp);
            }
        }
    }

    private function create_scheduled_temps_table() {
        $sql =<<<EOF
            CREATE TABLE IF NOT EXISTS ScheduledTemps(
            Date        DATETIME    NOT NULL,
            Temperature        REAL        NOT NULL,
            PRIMARY KEY(Date))
EOF;

        //$this->db->exec($sql) or die("ERROR " + $this->db->lastErrorCode() + ": " + $this->db->lastErrorMsg()) ;        

        try {
            $this->db->exec($sql);
        }
        catch (Exception $e) {
            error_log($e->getCode());
            error_log($e->getMessage());
        }
    }

    private function create_configs_table() {
        $sql =<<<EOF
            CREATE TABLE IF NOT EXISTS Configs(
            Key         TEXT    NOT NULL,
            Value       TEXT    NOT NULL,     
            PRIMARY KEY(Key))
EOF;

        //$this->db->exec($sql) or die("ERROR " + $this->db->lastErrorCode() + ": " + $this->db->lastErrorMsg());   

        try {
            $this->db->exec($sql);
        }
        catch (Exception $e) {
            error_log($e->getCode());
            error_log($e->getMessage());
            return;
        }

        $this->create_config('manualBoilerTemperature', 2);
        $this->create_config('minTemp', 2);
        $this->create_config('maxTemp', 35);
        $this->create_config('manualMode', 1);       
    }

    private function create_users_table() {
        $sql =<<<EOF
            CREATE TABLE IF NOT EXISTS Users(
            Username        TEXT    NOT NULL,
            Password        TEXT    NOT NULL,
            PRIMARY KEY(Username))
EOF;

        try {
            $this->db->exec($sql);
        }
        catch (Exception $e) {
            error_log($e->getCode());
            error_log($e->getMessage());
            return;
        }
    }

    function print_daily_temps_table() {
        $sql =<<<EOF
            SELECT * from DailyTemps     
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query print_daily_temps_table Failed');

        return $this->build_output_multiple_rows($result);
    }

    function print_scheduled_temps_table() {
        $sql =<<<EOF
            SELECT * from ScheduledTemps
            ORDER BY Date   
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query print_scheduled_temps_table Failed');

        return $this->build_output_multiple_rows($result);
    }

    function print_configs_table() {
        $sql =<<<EOF
            SELECT * from Configs     
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query print_configs_table Failed');

        return $this->build_output_multiple_rows($result);
    }

    function print_users_table() {
        $sql =<<<EOF
            SELECT * from Users     
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query print_users_table Failed');

        return $this->build_output_multiple_rows($result);
    }

    function create_daily_temp($day, $hour, $temp) {
    	
    	$formattedDay =  $this->format_day($day);
		if ($formattedDay == null)
			return array('data' => null, 'error' => 'Wrong day format');
    	
        $sql =<<<EOF
            INSERT INTO DailyTemps(Day, Hour, Temperature)
            VALUES(:day, :hour, :temp)
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':day', $formattedDay);
        $stmt->bindValue(':hour', $hour);
        $stmt->bindValue(':temp', $temp);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query create_daily_temp Failed');

        return array('data' => null, 'error' => null);
    }

    function read_daily_temps($targetTime) {
    	
    	$sqlSelectTarget = "";	
		$sqlConditionTarget = "";
		$sqlConditionFilter = "";
    	
    	if (strrpos($targetTime, ':')) {
			$sqlSelectTarget = "Day";	
			$sqlConditionTarget = "Hour";
			$sqlConditionFilter = $targetTime;
		}
		else {
			$sqlSelectTarget = "Hour";	
			$sqlConditionTarget = "Day";
			$sqlConditionFilter	= $this->format_day($targetTime);
		}
				
		$sql =<<<EOF
            SELECT $sqlSelectTarget, Temperature FROM DailyTemps
            WHERE $sqlConditionTarget LIKE :sqlConditionFilter
EOF;
		
		/*$formattedDay =  $this->format_day($day);
		if ($formattedDay == null)
			return array('data' => null, 'error' => 'Wrong day format');
    	
        $sql =<<<EOF
            SELECT Hour, Temperature FROM DailyTemps
            WHERE Day LIKE :day
EOF;*/

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':sqlConditionFilter', $sqlConditionFilter);
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query read_daily_temps Failed');
        
        return $this->build_output_multiple_rows($result);
    }

    function read_daily_temp($day, $hour) {
    	
		$formattedDay =  $this->format_day($day);
		if ($formattedDay == null)
			return array('data' => null, 'error' => 'Wrong day format');
			
        $sql =<<<EOF
            SELECT Temperature FROM DailyTemps
            WHERE Day LIKE :day AND Hour LIKE :hour
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':day', $formattedDay);
        $stmt->bindValue(':hour', $hour);
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query read_daily_temp Failed');

        return $this->build_output_single_value($result, 'Temperature');       
    }
    
//    function update_daily_temps_($day, $temp) {
//        $sql =<<<EOF
//            UPDATE daily_temps
//            SET temperature = :temp
//            WHERE day LIKE :day
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':day', $this->format_day($day));
//        $stmt->bindValue(':temp', $temp);
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query update_daily_temps Failed');

//        return array('data' => null, 'error' => null);
//    }

    function update_all_daily_temps($json) {

        $dict = json_decode($json, true);
        $values = "";
        foreach ($dict as $hour => $temperature) {
            $values = $values . "('$hour', $temperature),";
        };
        $values = rtrim($values, ",") . '';

        $sql =<<<EOF
            WITH Record(Hour, Temperature) AS (VALUES $values)
            UPDATE DailyTemps
            SET Temperature = (SELECT Temperature FROM Record WHERE Record.Hour = DailyTemps.Hour)
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query update_all_daily_temps Failed');

        return array('data' => null, 'error' => null);
    }

    function update_daily_temps($targetTime, $json) {
    	
    	$dict = json_decode($json, true);               
        $sqlUpdateTarget = "";
        $sqlUpdateValues = ""; 
        $sqlConditionTarget = "";
        $sqlConditionFilter = "";                       

		if (strrpos($targetTime, ':') != FALSE) {
			$sqlUpdateTarget = "Day";	
			$sqlConditionTarget = "Hour";
			$sqlConditionFilter = $targetTime;
		}
		else {
			$sqlUpdateTarget = "Hour";	
			$sqlConditionTarget = "Day";
			$sqlConditionFilter	= $this->format_day($targetTime);
		}
					    	   		
		foreach ($dict as $time => $temperature) {
        	$sqlUpdateValues = $sqlUpdateValues . "('$time', $temperature),";
	    };
    	$sqlUpdateValues = rtrim($sqlUpdateValues, ",") . '';    	
		
    	$sql =<<<EOF
            WITH Record($sqlUpdateTarget, Temperature) AS (VALUES $sqlUpdateValues)
            UPDATE DailyTemps
            SET Temperature = (SELECT Temperature FROM Record WHERE Record.$sqlUpdateTarget = DailyTemps.$sqlUpdateTarget)
            WHERE $sqlConditionTarget LIKE :sqlConditionFilter
EOF;
		
        $stmt = $this->db->prepare($sql);         
        //$stmt->bindValue(':sqlUpdateValues', $sqlUpdateValues); DOESN'T SEEM TO WORK...
        $stmt->bindValue(':sqlConditionFilter', $sqlConditionFilter);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query update_daily_temps Failed');

        return array('data' => null, 'error' => null);
    }

    function update_daily_temp($day, $hour, $temp) {
    	
    	$formattedDay =  $this->format_day($day);
		if ($formattedDay == null)
			return array('data' => null, 'error' => 'Wrong day format');
			
        $sql =<<<EOF
            UPDATE DailyTemps
            SET Temperature = :temp
            WHERE Day LIKE :day AND Hour LIKE :hour
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':day', $formattedDay);
        $stmt->bindValue(':hour', $hour);
        $stmt->bindValue(':temp', $temp);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query update_daily_temp Failed');

        return array('data' => null, 'error' => null);
    }

    function delete_daily_temps($day) {
        $this->update_daily_temps($day, 2);
    }

    function delete_daily_temp($day, $hour) {
        $this->update_daily_temp($day, $hour, 2);
    }

    function reset_daily_temps_table() {
        $sql =<<<EOF
            DROP TABLE DailyTemps
EOF;
        $result = $this->db->exec($sql);

        if (!$result)
            return array('data' => null, 'error' => 'Query reset_daily_temps_table Failed');

        $this->create_daily_temps_table();
    }

    //function create_scheduled_temps($json) {

    //$dt = new DateTime($dict['dateBefore']);        

    //    $dict = json_decode($json, true);
    //    $values = "";
    //    foreach ($dict as $date => $temperature) {
    //        $date = $this->format_date($date);
    //        $values = $values . "('$date', $temperature),";
    //    };
    //    $values = rtrim($values, ",") . ';';

    //    $sql = "INSERT OR REPLACE INTO scheduled_temps(date, temperature) VALUES $values";

    //    $result = $this->db->exec($sql);

    //    if (!$result)
    //        return array('data' => null, 'error' => 'Query create_scheduled_temps Failed');

    //    return array('data' => null, 'error' => null);                   
    //}

    function create_scheduled_temps($interval, $temperatures) {

        $days = json_decode($interval, true);
        $currentDay = new DateTime($days['dateBefore']);
        $currentDay->add(new DateInterval('PT1H'));
        $dayAfter = new DateTime($days['dateAfter']);
        //$dayAfter->sub(new DateInterval('PT1H'));

        $temps = json_decode($temperatures, true);
        $temps = $temps['Temperatures'];
        $values = '';
        $index = 0;

        while($currentDay < $dayAfter) {
            $date = $this->format_date($currentDay->format(DateTime::ATOM));
            $temperature = $temps[$index];
            $values = $values . "('$date', $temperature),";
            $currentDay->add(new DateInterval('PT1H'));
            $index = $index + 1;            
        };
        $values = rtrim($values, ",") . ';';

        $sql = "INSERT OR REPLACE INTO ScheduledTemps(Date, Temperature) VALUES $values";

        $result = $this->db->exec($sql);

        if (!$result)
            return array('data' => null, 'error' => 'Query create_scheduled_temps Failed');

        return array('data' => null, 'error' => null);                   
    }

//    function create_scheduled_temp($date, $temp) {
//        $sql =<<<EOF
//            INSERT OR REPLACE INTO scheduled_temps(date, temperature)
//            VALUES(:date, :temp);
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':date', $this->format_date($date));
//        $stmt->bindValue(':temp', $temp);
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query create_scheduled_temp Failed');

//        return array('data' => null, 'error' => null);
//    }

    function read_scheduled_dates() {

        $sql =<<<EOF
            SELECT Date from ScheduledTemps
            WHERE DATE LIKE '%00:00:00%'
            ORDER BY Date   
EOF;

        $stmt = $this->db->prepare($sql); 
        $result = $stmt->execute();
        if (!$result)
            return array('data' => null, 'error' => 'Query read_scheduled_dates Failed');

        return $this->build_output_multiple_values($result, 'Date');    
    }

//    function read_scheduled_temps_($dateBefore, $dateAfter) {

//        $sql =<<<EOF
//            SELECT temperature FROM scheduled_temps
//            WHERE date > :dateBefore AND date < :dateAfter
//            ORDER BY date
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':dateBefore', $this->format_date($dateBefore));
//        $stmt->bindValue(':dateAfter', $this->format_date($dateAfter));
        
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query read_daily_temps Failed');

//        return $this->build_output_multiple_values($result, 'temperature');   
//    }

    function read_scheduled_temps($json) {

        $dict = json_decode($json, true);
        
        $sql =<<<EOF
            SELECT Temperature FROM ScheduledTemps
            WHERE Date > :dateBefore AND Date < :dateAfter
            ORDER BY Date
EOF;
        
        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':dateBefore', $this->format_date($dict['dateBefore']));
        $stmt->bindValue(':dateAfter', $this->format_date($dict['dateAfter']));
        
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query read_daily_temps Failed');

        return $this->build_output_multiple_values($result, 'Temperature');   
    }

//    function read_scheduled_temp($date) {
//        $sql =<<<EOF
//            SELECT Temperature FROM scheduled_temps
//            WHERE date LIKE :date
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':date', $this->format_date($date));
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query read_daily_temp Failed');

//        return $this->build_output_single_value($result, 'temperature');   
//    }

//    function update_scheduled_temp($date, $temp) {
//        $sql =<<<EOF
//            UPDATE scheduled_temps
//            SET temperature = :temp
//            WHERE date LIKE :date
//EOF;
        
//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':date', $this->format_date($date));
//        $stmt->bindValue(':temp', $temp);
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query update_scheduled_temp Failed');

//        return array('data' => null, 'error' => null);
//    }

//    function delete_scheduled_temp($date) {
//        $sql =<<<EOF
//            DELETE FROM scheduled_temps
//            WHERE date LIKE :date
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':date', $this->format_date($date));
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query delete_scheduled_temp Failed');

//        return array('data' => null, 'error' => null);
//    }

//    function delete_scheduled_temps_($dates) {

//        $_dates = join(',', $dates);  

//        $sql =<<<EOF
//            DELETE FROM scheduled_temps
//            WHERE date IN :dates
//EOF;

//        $stmt = $this->db->prepare($sql); 
//        $stmt->bindValue(':dates', $this->format_dates($_dates));
//        $result = $stmt->execute();

//        if (!$result)
//            return array('data' => null, 'error' => 'Query delete_scheduled_temp Failed');

//        return array('data' => null, 'error' => null);
//    }

    function delete_scheduled_temps($json) {

        $dict = json_decode($json, true);

        $sql =<<<EOF
            DELETE FROM ScheduledTemps
            WHERE Date > :dateBefore AND Date < :dateAfter
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':dateBefore', $this->format_date($dict['dateBefore']));
        $stmt->bindValue(':dateAfter', $this->format_date($dict['dateAfter']));   
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query delete_scheduled_temps Failed');

        return array('data' => null, 'error' => null);
    }

    function reset_scheduled_temps_table() {
        $sql =<<<EOF
            DROP TABLE ScheduledTemps
EOF;
        $result = $this->db->exec($sql);

        if (!$result)
            return array('data' => null, 'error' => 'Query reset_scheduled_temps_table Failed');

        $this->create_scheduled_temps_table();
    }

    function create_config($key, $value) {
        $sql =<<<EOF
            INSERT INTO Configs(Key, Value)
            VALUES(:key, :value);
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':key', $key);
        $stmt->bindValue(':value', $value);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query create_config Failed');

        return array('data' => null, 'error' => null);
    }

    function read_config($key) {
        $sql =<<<EOF
            SELECT Value FROM Configs
            WHERE Key LIKE :key
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':key', $key);       
        $result = $stmt->execute();
     
        if (!$result)
            return array('data' => null, 'error' => 'Query read_config Failed');

        return $this->build_output_single_value($result, 'Value');  
    }

    function update_config($key, $value) {
        $sql =<<<EOF
            UPDATE Configs
            SET Value = :value
            WHERE Key LIKE :key
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':key', $key);
        $stmt->bindValue(':value', $value);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query update_config Failed');

        return array('data' => null, 'error' => null);
    }

    function delete_config($key) {
        $sql =<<<EOF
            DELETE FROM Configs
            WHERE Key LIKE :key
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':key', $key);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query delete_config Failed');

        return array('data' => null, 'error' => null);
    }

    function reset_configs_table() {
        $sql =<<<EOF
            DROP TABLE Configs
EOF;
        $result = $this->db->exec($sql);

        if (!$result)
            return array('data' => null, 'error' => 'Query reset_configs_table Failed');

        $this->create_configs_table();
    }

    function return_exception_message($errno, $errstr) {
		   //return array('data' => null, 'error' => $errstr); 
		   $this->error['errnum'] = $errno;
		   $this->error['errmsg'] = $errstr;
    }

    function create_user($username, $password) {
        $sql =<<<EOF
            INSERT INTO Users(Username, Password)
            VALUES(:username, :password);
EOF;
       
        $hash = password_hash($password, PASSWORD_BCRYPT);       
        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':username', $username);
        $stmt->bindValue(':password', $hash);
        
        set_error_handler(array($this,'return_exception_message'), E_WARNING);
        $result = $stmt->execute();
        restore_error_handler();                                    

        if (!$result)
            return array('data' => null, 'error' => $this->error);

        return array('data' => null, 'error' => null);
    }   
    function read_user($username, $password) {
        $sql =<<<EOF
            SELECT Password FROM Users
            WHERE Username LIKE :username
EOF;
                
        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':username', $username);       
        $result = $stmt->execute();        

        if (!$result)
            return array('data' => null, 'error' => 'Query validate_user Failed');

        $row = $result->fetchArray(SQLITE3_ASSOC);
        $hash = $row['Password'];       
        $valid = password_verify($password , $hash);

        return array('data' => $valid, 'error' => null);
} 
    function update_user($username, $password) {
        $sql =<<<EOF
            UPDATE Users
            SET Password = :password
            WHERE Username LIKE :username
EOF;
       
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':username', $username);
        $stmt->bindValue(':password', $hash);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query update_user Failed');

        return array('data' => null, 'error' => null);
    }

    function delete_user($username) {
     $sql =<<<EOF
            DELETE FROM Users
            WHERE Username LIKE :username
EOF;

        $stmt = $this->db->prepare($sql); 
        $stmt->bindValue(':username', $username);
        $result = $stmt->execute();

        if (!$result)
            return array('data' => null, 'error' => 'Query delete_user Failed');

        return array('data' => null, 'error' => null);
    }

    function reset_users_table() {
        $sql =<<<EOF
            DROP TABLE Users
EOF;
        $result = $this->db->exec($sql);

        if (!$result)
            return array('data' => null, 'error' => 'Query reset_users_table Failed');

        $this->create_users_table();
    }
    
    function reset() {    
        $this->reset_daily_temps_table();
        $this->reset_scheduled_temps_table();
        $this->reset_configs_table();
        $this->reset_users_table();
	}   
                             
    public function exec_method(){
        //parse_str(parse_url($url, PHP_URL_QUERY), $array);
        //var_dump($array);

        $url =($_SERVER['REQUEST_URI']);
        $command = substr($url, strrpos($url, '/') + 1);

        $array = explode('&', $command);
        
        $func = array_shift($array);
        $params = array();
        foreach($array as $param) {
            array_push($params, explode('=', $param)[1]);
        }

        if (method_exists($this,$func))
            call_user_func_array(array($this,$func), $params);       
    }        
}

?>