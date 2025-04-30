[Guide](https://data-star.dev/guide)
[Reference](https://data-star.dev/reference)
[How Tos](https://data-star.dev/how_tos)
[Examples](https://data-star.dev/examples)

More

[DATASTAR EXPRESSIONS](https://data-star.dev/guide/datastar_expressions)

Stop Overcomplicating It
========================

Most of the time, if you run into issues when using Datastar, **you are probably overcomplicating it™**.

As explained in [going deeper](https://data-star.dev/guide/going_deeper)
, Datastar is a _hypermedia_ framework. If you approach it like a _JavaScript_ framework, you are likely to run into complications.

So how does one use a hypermedia framework?

The Datastar Way[#](https://data-star.dev/guide/stop_overcomplicating_it#the-datastar-way)

-------------------------------------------------------------------------------------------

Between [attribute plugins](https://data-star.dev/reference/attribute_plugins)
 and [action plugins](https://data-star.dev/reference/action_plugins)
, Datastar provides you with everything you need to build hypermedia-driven applications. Using this approach, the backend drives state to the frontend and acts as the single source of truth, determining what actions the user can take next.

Any additional JavaScript functionality you require that does _not_ work via [`data-*`](https://data-star.dev/reference/attribute_plugins)
 attributes and [`datastar-execute-script`](https://data-star.dev/reference/sse_events#datastar-execute-script)
 SSE events should ideally be extracted out into [external scripts](https://data-star.dev/guide/stop_overcomplicating_it#external-scripts)
 or, better yet, [web components](https://data-star.dev/guide/stop_overcomplicating_it#web-components)
.

Always encapsulate state and send **_props down, events up_**.

### External Scripts[#](https://data-star.dev/guide/stop_overcomplicating_it#external-scripts)

When using external scripts, pass data into functions via arguments and return a result _or_ listen for custom events dispatched from them (_props down, events up_).

In this way, the function is encapsulated – all it knows is that it receives input via an argument, acts on it, and optionally returns a result or dispatches a custom event – and `data-*` attributes can be used to drive reactivity.

    <div data-signals-result="''">
      <input data-bind-foo 
             data-on-input="$result = myfunction($foo)"
      >
      <span data-text="$result"></span>
    </div>
    

    function myfunction(data) {
      return `You entered ${data}`;
    }
    

If your function call is asynchronous then it will need to dispatch a custom event containing the result. While asynchronous code _can_ be placed within [Datastar expressions](https://data-star.dev/guide/datastar_expressions)
, Datastar will _not_ await it.

    <div data-signals-result="''"
         data-on-mycustomevent__window="$result = evt.detail.value"
    >
      <input data-bind-foo 
             data-on-input="myfunction($foo)"
      >
      <span data-text="$result"></span>
    </div>
    

    async function myfunction(data) {
      const value = await new Promise((resolve) => {
        setTimeout(() => resolve(`You entered ${data}`), 1000);
      });
      window.dispatchEvent(
        new CustomEvent('mycustomevent', {detail: {value}})
      );
    }
    

### Web Components[#](https://data-star.dev/guide/stop_overcomplicating_it#web-components)

[Web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
 allow you create reusable, encapsulated, custom elements. They are native to the web and require no external libraries or frameworks. Web components unlock [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
 – HTML tags with custom behavior and styling.

When using web components, pass data into them via attributes and listen for custom events dispatched from them (_props down, events up_).

In this way, the web component is encapsulated – all it knows is that it receives input via an attribute, acts on it, and optionally dispatches a custom event containing the result – and `data-*` attributes can be used to drive reactivity.

    <div data-signals-result="''">
      <input data-bind-foo />
      <my-component
          data-attr-src="$foo"
          data-on-mycustomevent="$result = evt.detail.value"
      ></my-component>
      <span data-text="$result"></span>
    </div>
    

    class MyComponent extends HTMLElement {
      static get observedAttributes() {
        return ['src'];
      }
    
      attributeChangedCallback(name, oldValue, newValue) {
        const value = `You entered ${newValue}`;
        this.dispatchEvent(
          new CustomEvent('mycustomevent', {detail: {value}})
        );
      }
    }
    
    customElements.define('my-component', MyComponent);
    

Since the `value` attribute is allowed on web components, it is also possible to use `data-bind` to bind a signal to the web component’s value. Note that a `change` event must be dispatched so that the event listener used by `data-bind` is triggered by the value change.

    <input data-bind-foo />
    <my-component
        data-attr-src="$foo"
        data-bind-result
    ></my-component>
    <span data-text="$result"></span>
    

    class MyComponent extends HTMLElement {
      static get observedAttributes() {
        return ['src'];
      }
    
      attributeChangedCallback(name, oldValue, newValue) {
        this.value = `You entered ${newValue}`;
        this.dispatchEvent(new Event('change'));
      }
    }
    
    customElements.define('my-component', MyComponent);
    

[DATASTAR EXPRESSIONS](https://data-star.dev/guide/datastar_expressions)
