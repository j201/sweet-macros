// if and while without the parens around the expression
let if = macro {
	rule {$cond:expr $body} => { if ($cond) $body }
}
let while = macro {
	rule {$cond:expr $body} => { while ($cond) $body }
}

macro _cond_macro {
	rule { { $pred:expr : $then:expr, $else ... } } => {
		$pred ? $then : _cond_macro {$else ...}
	}
	rule { {$base:expr} } => { ($base) }
}

// cond expression
macro cond  {
	rule { $body } => { (_cond_inner_macro $body) } // The only way I could get parens around the result
}

// var destructuring
let var = macro {
	rule { [$var (,) ...]  = $expr } => {
		var i = 0;
		var arr = $expr;
		$(var $var = arr[i++];) ...
	}

	rule { {$var (,) ...}  = $expr } => {
		var obj = $expr;
		$(var $var = obj.$var;) ...
	}

	rule { $var:ident  = $expr } => {
		var $var = $expr
	}
}

// .prototype. shortcut
macro # {
	rule{} => {.prototype.}
}

// Lots of function shortcuts
macro fn {
	// Base cases
	rule { $name:ident ($param:ident ...) { $body ... } } => {
		function $name ($param ...) { $body ... }
	}
	rule { $name:ident ($param:ident ...) => $return:expr } => {
		function $name ($param ...) { return $return; }
	}
	rule { ($param:ident ...) { $body ... } } => {
		function ($param ...) { $body ... }
	}
	rule { ($param:ident ...) => $return:expr } => {
		function ($param ...) { return $return; }
	}

	// Multiple definitions - not currently working with no params
	rule {
		$name:ident {
			$(($param:ident ...) { $body ... }) ...
		}
	} => {
		function $name () {
			$(if (arguments.length === [(null && $param) (,) ...].length) {
				var i = 0;
				var $param (,) ...
				($param = arguments[i++]) (;) ...
				$body ...
			}) ...
		}
	}
	
	// Without parens
	// _arrowOrBlock doesn't seem to work here
	rule { $param:ident ... => $return:expr } => {
		function ($param ...) { return $return; }
	}
	rule { $param:ident ... { $body ... } } => {
		function ($param ...) { $body ... }
	}
}

// Examples
/*

fn foo (a b) {
	return a + b;
}
fn foo (a b) => a + b;

(fn (a b) { return a + b; });

(fn (a b) => a + b);

(fn a b { return a + b; });

(fn a b => a + b);

fn foo {
	(a b) {
		return a + b;
	}
	(a b c) {
		return 0;
	}
}

*/
