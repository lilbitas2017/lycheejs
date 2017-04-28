
_harvester() {

	COMPREPLY=();

	local current="${COMP_WORDS[COMP_CWORD]}";

	if [ COMP_CWORD == 1 ]; then
		_longopt;
		return 0;
	fi;

	local binary=$(readlink -f `which ${COMP_WORDS[0]}`);

	if [ -f "$binary" ]; then

		local values=($($binary "--autocomplete" "${COMP_WORDS[@]:1}"));
		local values_length=${#values[@]};
		local current_length=${#current};

		if [ $values_length == 1 ]; then
			COMPREPLY=(${values[0]});
		else

			for (( v=0; v<values_length; v++ )) do

				local value=${values[$v]};
				if [ -n "$value" ] && [ "${value:0:$current_length}" == "$current" ]; then
					COMPREPLY+=(${values[$v]});
				fi;

			done

		fi;

		return 0;

	else

		return 0;

	fi;

}

complete -F _harvester lycheejs-breeder;
complete -F _harvester lycheejs-fertilizer;
complete -F _harvester lycheejs-harvester;
# complete -F _harvester lycheejs-ranger;
complete -F _harvester lycheejs-strainer;
# complete -F _harvester lycheejs-studio;

