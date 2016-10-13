<?php

//http://coreymaynard.com/blog/creating-a-restful-api-with-php/

require_once 'API.class.php';
require_once 'DatabaseManager.php';
require_once 'TokenValidation.php';

class DatabaseManagerApi extends API
{
    //protected $User;
    private $dbm;
    private $noauth_endpoints;

    public function __construct($request, $origin) {
        parent::__construct($request);

        $this->dbm = new DatabaseManager();
        $this->noauth_endpoints = array(
            'users' => 'POST'
        );    

        if (array_key_exists($this->endpoint, $this->noauth_endpoints) && $this->method == $this->noauth_endpoints[$this->endpoint])
            $this->authorized = true;
        else {
            if (!isTokenValid())
                $this->authorized = false;
            else
                $this->authorized = true;
        }           
    }

    //function daily_temps_ () {
    //    switch ($this->method) {
    //        case 'GET':
    //            $this->dbm->open();
    //            $result = $this->dbm->print_daily_temps_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        case 'DELETE':
    //            $this->dbm->open();
    //            $result = $this->dbm->reset_daily_temps_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        default:
    //            return "Invalid method!";
    //            break;
    //    }

    //}

    //function scheduled_temps_ () {
    //    switch ($this->method) {
    //        case 'GET':
    //            $this->dbm->open();
    //            $result = $this->dbm->print_scheduled_temps_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        case 'DELETE':
    //            $this->dbm->open();
    //            $result = $this->dbm->reset_scheduled_temps_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        default:
    //            return "Invalid method!";
    //            break;
    //    }
    //}

    //function configs_ () {
    //    switch ($this->method) {
    //        case 'GET':
    //            $this->dbm->open();
    //            $result = $this->dbm->print_configs_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        case 'DELETE':
    //            $this->dbm->open();
    //            $result = $this->dbm->reset_configs_table();
    //            $this->dbm->close();
    //            return $result;
    //            break;
    //        default:
    //            return "Invalid method!";
    //            break;
    //    }
    //}    

    function daily_temps($args) {        
        switch ($this->method) {
            case 'GET':
                if(count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->read_daily_temp($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->read_daily_temps($args[0]);
                    $this->dbm->close();
                    return $result;
                }
                $this->dbm->open();
                $result = $this->dbm->print_daily_temps_table();
                $this->dbm->close();
                return $result;               
                break;
            case 'POST':
                if(count($args) > 3)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args) && array_key_exists(2, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->create_daily_temp($args[0], $args[1], $args[2]);
                    $this->dbm->close();
                    return $result;
                }
                else 
                    throw new Exception('Missing argument');
                break;
            case 'PUT':
                if(count($args) > 3)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args) && array_key_exists(2, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_daily_temp($args[0], $args[1], $args[2]);
                    $this->dbm->close();
                    return $result;
                }
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_daily_temps($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_all_daily_temps($args[0]);
                    $this->dbm->close();
                    return $result;
                }
                else 
                    throw new Exception('Missing argument');
                break;
            case 'DELETE':
                if(count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->delete_daily_temp($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->delete_daily_temps($args[0]);
                    $this->dbm->close();
                    return $result;
                }                
                $this->dbm->open();
                $result = $this->dbm->reset_daily_temps_table();
                $this->dbm->close();
                return $result;
                break;                                
                break;
            default:
                throw new Exception('Invalid method');
                break;
        }
    }

    function scheduled_days($args) {
        switch ($this->method) {
            case 'GET':
                if (count($args) > 0)
                    throw new Exception('Too many Arguments');                                
                $this->dbm->open();
                $result = $this->dbm->read_scheduled_dates();                     
                $this->dbm->close();
                return $result;            
                break;           
            default:
                throw new Exception('Invalid method!');
                break;
        }
    }

    function scheduled_temps($args) {
        switch ($this->method) {
            case 'GET':
                if (count($args) > 1)
                    throw new Exception('Too many Arguments');                
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();                    
                    $result = $this->dbm->read_scheduled_temps($args[0]);                  
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                if (count($args) == 0) {
                    $this->dbm->open();
                    $result = $this->dbm->print_scheduled_temps_table();
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                    break;
                }
                throw new Exception('Missing argument');
                break;
            case 'POST':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->create_scheduled_temps($args[0], $args[1]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }               
                throw new Exception('Missing argument!');
                break;
            case 'PUT':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_scheduled_temp($args[0], $args[1]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                throw new Exception('Missing argument!');
                break;
            case 'DELETE':
                if (count($args) > 1)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->delete_scheduled_temps($args[0]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                if (count($args) == 0) {
                    $this->dbm->open();
                    $result = $this->dbm->reset_scheduled_temps_table();
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                throw new Exception('Missing argument!');
                break;
            default:
                throw new Exception('Invalid method!');
                break;
        }
    }

    function configs($args) {
        switch ($this->method) {
            case 'GET':
                if (count($args) > 1)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->read_config($args[0]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                if (count($args) == 0) {
                    $this->dbm->open();
                    $result = $this->dbm->print_configs_table();
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'POST':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->create_config($args[0], $args[1]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'PUT':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_config($args[0], $args[1]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'DELETE':
                if (count($args) > 1)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->delete_config($args[0]);
                    $this->dbm->close();
                    //unset($this->dbm);
                    return $result;
                }
                $this->dbm->open();
                $result = $this->dbm->reset_configs_table();
                $this->dbm->close();
                //unset($this->dbm);
                return $result;
                break;
            default:
                throw new Exception('Invalid method!');
                break;
        }
    }

    function users($args) {
        switch ($this->method) {
            case 'GET':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args)  && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->read_user($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                if (count($args) == 0) {
                    $this->dbm->open();
                    $result = $this->dbm->print_users_table();
                    $this->dbm->close();
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'POST':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->create_user($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'PUT':
                if (count($args) > 2)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args) && array_key_exists(1, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->update_user($args[0], $args[1]);
                    $this->dbm->close();
                    return $result;
                }
                throw new Exception('Missing argument');
                break;
            case 'DELETE':
                if (count($args) > 1)
                    throw new Exception('Too many Arguments');
                if (array_key_exists(0, $args)) {
                    $this->dbm->open();
                    $result = $this->dbm->delete_user($args[0]);
                    $this->dbm->close();
                    return $result;
                }
                $this->dbm->open();
                $result = $this->dbm->reset_users_table();
                $this->dbm->close();
                return $result;
                break;
            default:
                throw new Exception('Invalid method!');
                break;
        }
        
    }

    function reset() {
        if ($this->method == 'DELETE') {
            $this->dbm->open();
            $this->dbm->reset_daily_temps_table();
            $this->dbm->reset_scheduled_temps_table();
            $result = $this->dbm->reset_configs_table();
            $this->dbm->close();
            //unset($this->dbm);
            return $result;           
        }
        else
            throw new Exception('Invalid method!');    
    }
}

?>