ROOT = Dir.pwd

%w{9100 9101 9102 9103 9104}.each do |port|
  God.watch do |w|
    w.pid_file = "#{ROOT}/tmp/#{port}.pid"
    w.name = "soundcutter-#{port}"
    w.interval = 30.seconds
    w.start = "#{ROOT}/bin/server -p #{port} -P #{w.pid_file}"

    w.behavior(:clean_pid_file)

    w.start_if do |start|
      start.condition(:process_running) do |c|
        c.interval = 5.seconds
        c.running = false
      end
    end
  end
end
